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
      return this.classifyFailedQuery({ hostname, error });
    }
  }

  private classifyFailedQuery({
    hostname,
    error,
  }: {
    hostname: string;
    error: unknown;
  }): HostnameAvailability {
    switch (this.extractErrorCode(error)) {
      case 'ENOTFOUND':
      case 'NXDOMAIN':
        return 'AVAILABLE';
      case 'ENODATA':
        return 'OCCUPIED';
      default:
        this.logger.warn(
          `DNS availability query for ${hostname} was inconclusive: ${error}`,
        );

        return 'UNKNOWN';
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
