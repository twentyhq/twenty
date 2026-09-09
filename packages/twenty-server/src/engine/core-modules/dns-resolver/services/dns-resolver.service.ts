import { Injectable, Logger } from '@nestjs/common';

import { Resolver } from 'node:dns/promises';

import { isNonEmptyString } from '@sniptt/guards';

import {
  DNS_RESOLVER_QUERY_TIMEOUT_MS,
  DNS_RESOLVER_QUERY_TRIES,
} from 'src/engine/core-modules/dns-resolver/constants/dns-resolver-query.constant';
import { type HostnameAvailability } from 'src/engine/core-modules/dns-resolver/types/hostname-availability.type';

@Injectable()
export class DnsResolverService {
  private readonly logger = new Logger(DnsResolverService.name);

  async checkHostnameAvailability(
    hostname: string,
  ): Promise<HostnameAvailability> {
    const resolver = new Resolver({
      timeout: DNS_RESOLVER_QUERY_TIMEOUT_MS,
      tries: DNS_RESOLVER_QUERY_TRIES,
    });

    try {
      await resolver.resolve4(hostname);

      return 'OCCUPIED';
    } catch (error) {
      return this.classifyFailedQuery({ hostname, error, resolver });
    }
  }

  private async classifyFailedQuery({
    hostname,
    error,
    resolver,
  }: {
    hostname: string;
    error: unknown;
    resolver: Resolver;
  }): Promise<HostnameAvailability> {
    switch (this.extractErrorCode(error)) {
      case 'ENOTFOUND':
      case 'NXDOMAIN':
        return this.checkCnameAvailability({ hostname, resolver });
      case 'ENODATA':
        return 'OCCUPIED';
      default:
        this.logger.warn(
          `DNS availability query for ${hostname} was inconclusive: ${error}`,
        );

        return 'UNKNOWN';
    }
  }

  private async checkCnameAvailability({
    hostname,
    resolver,
  }: {
    hostname: string;
    resolver: Resolver;
  }): Promise<HostnameAvailability> {
    try {
      await resolver.resolveCname(hostname);

      return 'OCCUPIED';
    } catch (error) {
      switch (this.extractErrorCode(error)) {
        case 'ENOTFOUND':
        case 'NXDOMAIN':
        case 'ENODATA':
          break;
        default:
          this.logger.warn(
            `DNS CNAME availability query for ${hostname} was inconclusive, assuming no CNAME record exists: ${error}`,
          );
      }

      return 'AVAILABLE';
    }
  }

  private extractErrorCode(error: unknown): string | null {
    if (!(error instanceof Error) || !('code' in error)) {
      return null;
    }

    const { code } = error;

    return isNonEmptyString(code) ? code : null;
  }
}
