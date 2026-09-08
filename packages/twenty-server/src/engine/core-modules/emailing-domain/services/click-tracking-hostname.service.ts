/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { AvailableHostnameService } from 'src/engine/core-modules/dns-resolver/services/available-hostname.service';
import { CLICK_TRACKING_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/click-tracking-hostname-prefix.constant';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type EmailingHostnameProvisioner } from 'src/engine/core-modules/emailing-domain/types/emailing-hostname-provisioner.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ClickTrackingHostnameService implements EmailingHostnameProvisioner {
  readonly hostnameKind = 'click-tracking';

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly availableHostnameService: AvailableHostnameService,
  ) {}

  readHostname(emailingDomain: EmailingDomainEntity): string | null {
    return emailingDomain.clickTrackingHostname;
  }

  readHostnameId(emailingDomain: EmailingDomainEntity): string | null {
    return emailingDomain.clickTrackingHostnameId;
  }

  async resolveDesiredHostname(
    emailingDomain: EmailingDomainEntity,
  ): Promise<string | null> {
    if (!emailingDomain.isClickTrackingEnabled) {
      return null;
    }

    return this.availableHostnameService.findAvailableHostnameOrThrow({
      preferredPrefix: CLICK_TRACKING_HOSTNAME_PREFIX,
      domain: emailingDomain.domain,
    });
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
        clickTrackingHostname: hostname,
        clickTrackingHostnameId: hostnameId,
        clickTrackingHostnameStatus: ManagedHostnameStatus.PENDING,
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
      { clickTrackingHostnameStatus: status },
    );
  }

  async clearHostname(emailingDomain: EmailingDomainEntity): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        clickTrackingHostname: null,
        clickTrackingHostnameId: null,
        clickTrackingHostnameStatus: null,
      },
    );
  }
}
