/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { AvailableHostnameService } from 'src/engine/core-modules/dns-resolver/services/available-hostname.service';
import { TRACKING_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/tracking-hostname-prefix.constant';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type EmailingHostnameProvisioner } from 'src/engine/core-modules/emailing-domain/types/emailing-hostname-provisioner.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class CampaignTrackingHostnameService implements EmailingHostnameProvisioner {
  readonly hostnameKind = 'tracking';

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly availableHostnameService: AvailableHostnameService,
  ) {}

  readHostname(emailingDomain: EmailingDomainEntity): string | null {
    return emailingDomain.trackingHostname;
  }

  readHostnameId(emailingDomain: EmailingDomainEntity): string | null {
    return emailingDomain.trackingHostnameId;
  }

  async resolveDesiredHostname(
    emailingDomain: EmailingDomainEntity,
  ): Promise<string | null> {
    if (
      !emailingDomain.isClickTrackingEnabled &&
      !emailingDomain.isOpenTrackingEnabled
    ) {
      return null;
    }

    return this.availableHostnameService.findAvailableHostnameOrThrow({
      preferredPrefix: TRACKING_HOSTNAME_PREFIX,
      domain: emailingDomain.domain,
    });
  }

  async claimHostname({
    emailingDomain,
    hostname,
  }: {
    emailingDomain: EmailingDomainEntity;
    hostname: string;
  }): Promise<boolean> {
    const { affected } = await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      {
        id: emailingDomain.id,
        trackingHostname: IsNull(),
        trackingHostnameId: IsNull(),
      },
      { trackingHostname: hostname },
    );

    return (affected ?? 0) > 0;
  }

  async persistProvisionedHostname({
    emailingDomain,
    hostname,
    hostnameId,
  }: {
    emailingDomain: EmailingDomainEntity;
    hostname: string;
    hostnameId: string;
  }): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        trackingHostname: hostname,
        trackingHostnameId: hostnameId,
        trackingHostnameStatus: ManagedHostnameStatus.PENDING,
      },
    );
  }

  async persistStatus({
    emailingDomain,
    status,
  }: {
    emailingDomain: EmailingDomainEntity;
    status: ManagedHostnameStatus;
  }): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      { trackingHostnameStatus: status },
    );
  }

  async clearHostname(emailingDomain: EmailingDomainEntity): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        trackingHostname: null,
        trackingHostnameId: null,
        trackingHostnameStatus: null,
      },
    );
  }
}
