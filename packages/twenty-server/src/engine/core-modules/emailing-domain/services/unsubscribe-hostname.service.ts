/* @license Enterprise */
import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { UNSUBSCRIBE_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-hostname-prefix.constant';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class UnsubscribeHostnameService {
  private readonly logger = new Logger(UnsubscribeHostnameService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly dnsManagerService: DnsManagerService,
  ) {}

  async provision(emailingDomain: EmailingDomainEntity): Promise<void> {
    if (isNonEmptyString(emailingDomain.unsubscribeHostnameId)) {
      return;
    }

    const hostname = this.buildHostname(emailingDomain.domain);

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

  async refreshStatus(emailingDomain: EmailingDomainEntity): Promise<void> {
    if (!isNonEmptyString(emailingDomain.unsubscribeHostname)) {
      return;
    }

    const isWorking = await this.dnsManagerService.isHostnameWorking(
      emailingDomain.unsubscribeHostname,
    );

    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        unsubscribeHostnameStatus: isWorking
          ? UnsubscribeHostnameStatus.ACTIVE
          : UnsubscribeHostnameStatus.PENDING,
      },
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
    { provision }: { provision: boolean },
  ): Promise<void> {
    if (!this.dnsManagerService.isConfigured()) {
      return;
    }

    try {
      const emailingDomain = await this.emailingDomainRepository.findOneOrFail(
        workspaceId,
        { where: { id: emailingDomainId } },
      );

      if (provision) {
        await this.provision(emailingDomain);
      }

      await this.refreshStatus(
        await this.emailingDomainRepository.findOneOrFail(workspaceId, {
          where: { id: emailingDomainId },
        }),
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
    if (!isNonEmptyString(emailingDomain.unsubscribeHostname)) {
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

  private buildHostname(domain: string): string {
    return `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${domain}`;
  }
}
