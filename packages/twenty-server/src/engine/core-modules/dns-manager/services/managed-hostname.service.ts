/* @license Enterprise */
import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { type ManagedHostnameRecord } from 'src/engine/core-modules/dns-manager/types/managed-hostname-record.type';
import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';

@Injectable()
export class ManagedHostnameService {
  private readonly logger = new Logger(ManagedHostnameService.name);

  constructor(private readonly dnsManagerService: DnsManagerService) {}

  isConfigured(): boolean {
    return this.dnsManagerService.isConfigured();
  }

  async provision(hostname: string): Promise<string> {
    try {
      const createdHostname =
        await this.dnsManagerService.registerHostname(hostname);

      return createdHostname.id;
    } catch (error) {
      return this.adoptAlreadyRegisteredHostname(hostname, error);
    }
  }

  async resolveStatus(hostname: string): Promise<ManagedHostnameStatus> {
    const isWorking = await this.dnsManagerService.isHostnameWorking(hostname);

    return isWorking
      ? ManagedHostnameStatus.ACTIVE
      : ManagedHostnameStatus.PENDING;
  }

  async getCnameRecords(hostname: string): Promise<ManagedHostnameRecord[]> {
    try {
      const hostnameWithRecords =
        await this.dnsManagerService.getHostnameWithRecords(hostname);

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
      this.logger.warn(`Failed to read DNS records for ${hostname}: ${error}`);

      return [];
    }
  }

  async release(hostname: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    await this.dnsManagerService.deleteHostnameSilently(hostname);
  }

  private async adoptAlreadyRegisteredHostname(
    hostname: string,
    registrationError: unknown,
  ): Promise<string> {
    const isAlreadyRegistered =
      registrationError instanceof DnsManagerException &&
      registrationError.code ===
        DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED;

    if (!isAlreadyRegistered) {
      throw registrationError;
    }

    const existingHostnameId =
      await this.dnsManagerService.getHostnameId(hostname);

    if (!isNonEmptyString(existingHostnameId)) {
      throw registrationError;
    }

    return existingHostnameId;
  }
}
