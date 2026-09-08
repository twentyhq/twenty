/* @license Enterprise */
import { Injectable, Logger } from '@nestjs/common';

import { ManagedHostnameService } from 'src/engine/core-modules/dns-manager/services/managed-hostname.service';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { ClickTrackingHostnameService } from 'src/engine/core-modules/emailing-domain/services/click-tracking-hostname.service';
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
    private readonly clickTrackingHostnameService: ClickTrackingHostnameService,
  ) {}

  async sync(
    workspaceId: string,
    emailingDomainId: string,
    { provision }: { provision: boolean },
  ): Promise<void> {
    if (!this.managedHostnameService.isConfigured()) {
      return;
    }

    for (const provisioner of this.provisioners) {
      await this.syncProvisioner(provisioner, {
        workspaceId,
        emailingDomainId,
        provision,
      });
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

  async deprovision(emailingDomain: EmailingDomainEntity): Promise<void> {
    for (const provisioner of this.provisioners) {
      await provisioner.deprovision(emailingDomain);
    }
  }

  async getDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<VerificationRecord[]> {
    const recordsPerProvisioner = await Promise.all(
      this.provisioners.map((provisioner) =>
        provisioner.getDnsRecords(emailingDomain),
      ),
    );

    return recordsPerProvisioner.flat();
  }

  private get provisioners(): EmailingHostnameProvisioner[] {
    return [this.unsubscribeHostnameService, this.clickTrackingHostnameService];
  }

  private async syncProvisioner(
    provisioner: EmailingHostnameProvisioner,
    {
      workspaceId,
      emailingDomainId,
      provision,
    }: { workspaceId: string; emailingDomainId: string; provision: boolean },
  ): Promise<void> {
    try {
      if (provision) {
        await provisioner.provision(
          await this.findEmailingDomainOrFail(workspaceId, emailingDomainId),
        );
      }

      await provisioner.refreshStatus(
        await this.findEmailingDomainOrFail(workspaceId, emailingDomainId),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to sync ${provisioner.hostnameKind} hostname for emailing domain ${emailingDomainId}: ${error}`,
      );
    }
  }

  private async findEmailingDomainOrFail(
    workspaceId: string,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    return this.emailingDomainRepository.findOneOrFail(workspaceId, {
      where: { id: emailingDomainId },
    });
  }
}
