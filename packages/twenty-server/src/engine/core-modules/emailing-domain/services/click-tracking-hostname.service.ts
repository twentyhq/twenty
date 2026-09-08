/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { ManagedHostnameService } from 'src/engine/core-modules/dns-manager/services/managed-hostname.service';
import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { AvailableHostnameService } from 'src/engine/core-modules/dns-resolver/services/available-hostname.service';
import { CLICK_TRACKING_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/click-tracking-hostname-prefix.constant';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ClickTrackingHostnameService {
  readonly hostnameKind = 'click-tracking';

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly managedHostnameService: ManagedHostnameService,
    private readonly availableHostnameService: AvailableHostnameService,
  ) {}

  async provision(emailingDomain: EmailingDomainEntity): Promise<void> {
    if (
      !emailingDomain.clickTrackingEnabled ||
      isNonEmptyString(emailingDomain.clickTrackingHostnameId)
    ) {
      return;
    }

    const clickTrackingHostname =
      await this.availableHostnameService.findAvailableHostname({
        preferredPrefix: CLICK_TRACKING_HOSTNAME_PREFIX,
        domain: emailingDomain.domain,
      });

    const clickTrackingHostnameId = await this.managedHostnameService.provision(
      clickTrackingHostname,
    );

    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        clickTrackingHostname,
        clickTrackingHostnameId,
        clickTrackingHostnameStatus: ManagedHostnameStatus.PENDING,
      },
    );
  }

  async refreshStatus(emailingDomain: EmailingDomainEntity): Promise<void> {
    if (!isNonEmptyString(emailingDomain.clickTrackingHostname)) {
      return;
    }

    const clickTrackingHostnameStatus =
      await this.managedHostnameService.resolveStatus(
        emailingDomain.clickTrackingHostname,
      );

    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      { clickTrackingHostnameStatus },
    );
  }

  async deprovision(emailingDomain: EmailingDomainEntity): Promise<void> {
    if (!isNonEmptyString(emailingDomain.clickTrackingHostname)) {
      return;
    }

    await this.managedHostnameService.release(
      emailingDomain.clickTrackingHostname,
    );

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

  async getDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<VerificationRecord[]> {
    if (!isNonEmptyString(emailingDomain.clickTrackingHostname)) {
      return [];
    }

    return this.managedHostnameService.getCnameRecords(
      emailingDomain.clickTrackingHostname,
    );
  }
}
