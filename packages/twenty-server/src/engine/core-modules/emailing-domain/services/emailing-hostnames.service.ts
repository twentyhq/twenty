/* @license Enterprise */
import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { ManagedHostnameService } from 'src/engine/core-modules/dns-manager/services/managed-hostname.service';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { CampaignTrackingHostnameService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-hostname.service';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
import { type EmailingHostnameProvisioner } from 'src/engine/core-modules/emailing-domain/types/emailing-hostname-provisioner.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class EmailingHostnamesService {
  private readonly logger = new Logger(EmailingHostnamesService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly managedHostnameService: ManagedHostnameService,
    private readonly unsubscribeHostnameService: UnsubscribeHostnameService,
    private readonly campaignTrackingHostnameService: CampaignTrackingHostnameService,
  ) {}

  async sync({
    workspaceId,
    emailingDomainId,
    provision,
  }: {
    workspaceId: string;
    emailingDomainId: string;
    provision: boolean;
  }): Promise<void> {
    if (!this.managedHostnameService.isConfigured()) {
      return;
    }

    for (const provisioner of this.provisioners) {
      try {
        if (provision) {
          await this.provision({
            provisioner,
            emailingDomain: await this.findEmailingDomainOrFail({
              workspaceId,
              emailingDomainId,
            }),
          });
        }

        await this.refreshStatus({
          provisioner,
          emailingDomain: await this.findEmailingDomainOrFail({
            workspaceId,
            emailingDomainId,
          }),
        });
      } catch (error) {
        this.logger.warn(
          `Failed to sync ${provisioner.hostnameKind} hostname for emailing domain ${emailingDomainId}: ${error}`,
        );
      }
    }
  }

  async withDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<EmailingDomainEntity> {
    const hostnameRecords = await this.getDnsRecords(emailingDomain);

    if (hostnameRecords.length === 0) {
      return emailingDomain;
    }

    return {
      ...emailingDomain,
      verificationRecords: [
        ...(emailingDomain.verificationRecords ?? []),
        ...hostnameRecords,
      ],
    };
  }

  async getDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<VerificationRecord[]> {
    const recordsPerProvisioner = await Promise.all(
      this.provisioners.map((provisioner) =>
        this.getProvisionerDnsRecords({ provisioner, emailingDomain }),
      ),
    );

    return recordsPerProvisioner.flat();
  }

  async deprovision(emailingDomain: EmailingDomainEntity): Promise<void> {
    for (const provisioner of this.provisioners) {
      await this.release({ provisioner, emailingDomain });
    }
  }

  private get provisioners(): EmailingHostnameProvisioner[] {
    return [
      this.unsubscribeHostnameService,
      this.campaignTrackingHostnameService,
    ];
  }

  private async provision({
    provisioner,
    emailingDomain,
  }: {
    provisioner: EmailingHostnameProvisioner;
    emailingDomain: EmailingDomainEntity;
  }): Promise<void> {
    if (isNonEmptyString(provisioner.readHostnameId(emailingDomain))) {
      return;
    }

    const hostname = await this.reuseOrClaimHostname({
      provisioner,
      emailingDomain,
    });

    if (!isNonEmptyString(hostname)) {
      return;
    }

    const hostnameId = await this.managedHostnameService.provision(hostname);

    await provisioner.persistProvisionedHostname({
      emailingDomain,
      hostname,
      hostnameId,
    });
  }

  private async reuseOrClaimHostname({
    provisioner,
    emailingDomain,
  }: {
    provisioner: EmailingHostnameProvisioner;
    emailingDomain: EmailingDomainEntity;
  }): Promise<string | null> {
    const claimedHostname = provisioner.readHostname(emailingDomain);

    if (isNonEmptyString(claimedHostname)) {
      return claimedHostname;
    }

    const hostname = await provisioner.resolveDesiredHostname(emailingDomain);

    if (!isNonEmptyString(hostname)) {
      return null;
    }

    const isClaimed = await provisioner.claimHostname({
      emailingDomain,
      hostname,
    });

    return isClaimed ? hostname : null;
  }

  private async refreshStatus({
    provisioner,
    emailingDomain,
  }: {
    provisioner: EmailingHostnameProvisioner;
    emailingDomain: EmailingDomainEntity;
  }): Promise<void> {
    const hostname = provisioner.readHostname(emailingDomain);

    if (
      !isNonEmptyString(hostname) ||
      !isNonEmptyString(provisioner.readHostnameId(emailingDomain))
    ) {
      return;
    }

    await provisioner.persistStatus({
      emailingDomain,
      status: await this.managedHostnameService.resolveStatus(hostname),
    });
  }

  private async release({
    provisioner,
    emailingDomain,
  }: {
    provisioner: EmailingHostnameProvisioner;
    emailingDomain: EmailingDomainEntity;
  }): Promise<void> {
    const hostname = provisioner.readHostname(emailingDomain);

    if (!isNonEmptyString(hostname)) {
      return;
    }

    if (!isNonEmptyString(provisioner.readHostnameId(emailingDomain))) {
      await provisioner.clearHostname(emailingDomain);

      return;
    }

    const isReleased = await this.managedHostnameService.release(hostname);

    if (!isReleased) {
      this.logger.warn(
        `Failed to release ${provisioner.hostnameKind} hostname ${hostname} for emailing domain ${emailingDomain.id}, keeping it in database for retry`,
      );

      return;
    }

    await provisioner.clearHostname(emailingDomain);
  }

  private async getProvisionerDnsRecords({
    provisioner,
    emailingDomain,
  }: {
    provisioner: EmailingHostnameProvisioner;
    emailingDomain: EmailingDomainEntity;
  }): Promise<VerificationRecord[]> {
    const hostname = provisioner.readHostname(emailingDomain);

    if (
      !isNonEmptyString(hostname) ||
      !isNonEmptyString(provisioner.readHostnameId(emailingDomain))
    ) {
      return [];
    }

    return this.managedHostnameService.getCnameRecords(hostname);
  }

  private async findEmailingDomainOrFail({
    workspaceId,
    emailingDomainId,
  }: {
    workspaceId: string;
    emailingDomainId: string;
  }): Promise<EmailingDomainEntity> {
    return this.emailingDomainRepository.findOneOrFail(workspaceId, {
      where: { id: emailingDomainId },
    });
  }
}
