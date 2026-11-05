/* @license Enterprise */
import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { RECIPIENT_LINKS_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/recipient-links-hostname-prefix.constant';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class UnsubscribeHostnameService {
  private readonly logger = new Logger(UnsubscribeHostnameService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly dnsManagerService: DnsManagerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private async register(
    emailingDomain: EmailingDomainEntity,
    hostname: string,
  ): Promise<void> {
    const unsubscribeHostnameId = await this.registerOrAdoptHostname(hostname);

    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        unsubscribeHostname: hostname,
        unsubscribeHostnameId,
        unsubscribeHostnameStatus: UnsubscribeHostnameStatus.PENDING,
      },
    );
  }

  private async registerOrAdoptHostname(hostname: string): Promise<string> {
    try {
      const createdHostname =
        await this.dnsManagerService.registerHostname(hostname);

      return createdHostname.id;
    } catch (error) {
      if (
        error instanceof DnsManagerException &&
        error.code === DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED
      ) {
        const existingHostnameId =
          await this.dnsManagerService.getHostnameId(hostname);

        if (isNonEmptyString(existingHostnameId)) {
          return existingHostnameId;
        }
      }

      throw error;
    }
  }

  private async refreshStatus(
    emailingDomain: EmailingDomainEntity,
    { isUserTriggered }: { isUserTriggered: boolean },
  ): Promise<void> {
    const hostname = this.getRegisteredOrNewHostname(emailingDomain);

    const validationState =
      await this.dnsManagerService.getHostnameValidationState(hostname);

    switch (validationState) {
      case 'active':
        return this.updateStatus(
          emailingDomain,
          UnsubscribeHostnameStatus.ACTIVE,
        );
      case 'pending':
        return this.updateStatus(
          emailingDomain,
          UnsubscribeHostnameStatus.PENDING,
        );
      case 'missing':
        if (await this.isRestartAllowed(hostname, { isUserTriggered })) {
          return this.register(emailingDomain, hostname);
        }

        return this.updateStatus(
          emailingDomain,
          UnsubscribeHostnameStatus.FAILED,
        );
      case 'given_up':
        if (await this.isRestartAllowed(hostname, { isUserTriggered })) {
          await this.dnsManagerService.refreshHostname(hostname);

          return this.updateStatus(
            emailingDomain,
            UnsubscribeHostnameStatus.PENDING,
          );
        }

        return this.updateStatus(
          emailingDomain,
          UnsubscribeHostnameStatus.FAILED,
        );
    }
  }

  private getRegisteredOrNewHostname(
    emailingDomain: EmailingDomainEntity,
  ): string {
    if (
      isNonEmptyString(emailingDomain.unsubscribeHostnameId) &&
      isNonEmptyString(emailingDomain.unsubscribeHostname)
    ) {
      return emailingDomain.unsubscribeHostname;
    }

    return this.buildHostname(emailingDomain.domain);
  }

  private async isRestartAllowed(
    hostname: string,
    { isUserTriggered }: { isUserTriggered: boolean },
  ): Promise<boolean> {
    if (isUserTriggered) {
      return true;
    }

    return (
      (await this.dnsManagerService.lookupHostnameDnsState(hostname)) ===
      'found'
    );
  }

  private async updateStatus(
    emailingDomain: EmailingDomainEntity,
    unsubscribeHostnameStatus: UnsubscribeHostnameStatus,
  ): Promise<void> {
    if (
      emailingDomain.unsubscribeHostnameStatus === unsubscribeHostnameStatus
    ) {
      return;
    }

    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      { unsubscribeHostnameStatus },
    );
  }

  async deprovision(emailingDomain: EmailingDomainEntity): Promise<void> {
    if (
      !this.dnsManagerService.isConfigured() ||
      !isNonEmptyString(emailingDomain.unsubscribeHostname)
    ) {
      return;
    }

    await this.dnsManagerService.deleteHostnameSilently(
      emailingDomain.unsubscribeHostname,
    );
  }

  async sync(
    workspaceId: string,
    emailingDomainId: string,
    { isUserTriggered }: { isUserTriggered: boolean },
  ): Promise<void> {
    try {
      if (!this.dnsManagerService.isConfigured()) {
        await this.useServerHostname(workspaceId, emailingDomainId);

        return;
      }

      await this.refreshStatus(
        await this.emailingDomainRepository.findOneOrFail(workspaceId, {
          where: { id: emailingDomainId },
        }),
        { isUserTriggered },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to sync unsubscribe hostname for emailing domain ${emailingDomainId}: ${error}`,
      );
    }
  }

  async withDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<EmailingDomainEntity> {
    const unsubscribeRecords = await this.getDnsRecords(emailingDomain);

    if (unsubscribeRecords.length === 0) {
      return emailingDomain;
    }

    return {
      ...emailingDomain,
      verificationRecords: [
        ...(emailingDomain.verificationRecords ?? []),
        ...unsubscribeRecords,
      ],
    };
  }

  async getDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<VerificationRecord[]> {
    if (
      !this.dnsManagerService.isConfigured() ||
      !isNonEmptyString(emailingDomain.unsubscribeHostname)
    ) {
      return [];
    }

    try {
      const hostnameWithRecords =
        await this.dnsManagerService.getHostnameWithRecords(
          emailingDomain.unsubscribeHostname,
        );

      if (!isDefined(hostnameWithRecords)) {
        return [];
      }

      return hostnameWithRecords.records.map((record) => ({
        type: 'CNAME' as const,
        key: record.key,
        value: record.value,
        status: record.status,
      }));
    } catch (error) {
      this.logger.warn(
        `Failed to read unsubscribe DNS records for ${emailingDomain.unsubscribeHostname}: ${error}`,
      );

      return [];
    }
  }

  private async useServerHostname(
    workspaceId: string,
    emailingDomainId: string,
  ): Promise<void> {
    const serverUrl = new URL(this.twentyConfigService.get('SERVER_URL'));

    if (serverUrl.protocol !== 'https:') {
      return;
    }

    await this.emailingDomainRepository.update(
      workspaceId,
      { id: emailingDomainId },
      {
        unsubscribeHostname: serverUrl.host,
        unsubscribeHostnameId: null,
        unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
      },
    );
  }

  private buildHostname(domain: string): string {
    return `${RECIPIENT_LINKS_HOSTNAME_PREFIX}.${domain}`;
  }
}
