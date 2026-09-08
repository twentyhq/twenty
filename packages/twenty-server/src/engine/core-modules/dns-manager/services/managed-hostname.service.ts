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
      return this.adoptAlreadyRegisteredHostname({
        hostname,
        registrationError: error,
      });
    }
  }

  async resolveStatus(hostname: string): Promise<ManagedHostnameStatus> {
    const hostnameWithRecords =
      await this.dnsManagerService.getHostnameWithRecords(hostname);

    if (!isDefined(hostnameWithRecords)) {
      return ManagedHostnameStatus.PENDING;
    }

    const redirectionStatus = hostnameWithRecords.records.find(
      (record) => record.validationType === 'redirection',
    )?.status;
    const sslStatus = hostnameWithRecords.records.find(
      (record) => record.validationType === 'ssl',
    )?.status;

    if (redirectionStatus === 'success' && sslStatus === 'success') {
      return ManagedHostnameStatus.ACTIVE;
    }

    if (isNonEmptyString(sslStatus) && this.isTerminalSslFailure(sslStatus)) {
      return ManagedHostnameStatus.FAILED;
    }

    return ManagedHostnameStatus.PENDING;
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

  async release(hostname: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return true;
    }

    try {
      const hostnameId = await this.dnsManagerService.getHostnameId(hostname);

      if (isNonEmptyString(hostnameId)) {
        await this.dnsManagerService.deleteHostname(hostnameId);
      }

      return true;
    } catch (error) {
      this.logger.warn(`Failed to release hostname ${hostname}: ${error}`);

      return false;
    }
  }

  private isTerminalSslFailure(sslStatus: string): boolean {
    return (
      sslStatus.endsWith('_timed_out') ||
      sslStatus === 'expired' ||
      sslStatus === 'inactive'
    );
  }

  private async adoptAlreadyRegisteredHostname({
    hostname,
    registrationError,
  }: {
    hostname: string;
    registrationError: unknown;
  }): Promise<string> {
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
