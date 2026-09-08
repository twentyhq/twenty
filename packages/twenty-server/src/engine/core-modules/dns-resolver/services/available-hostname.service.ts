import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { randomInt } from 'node:crypto';

import {
  HOSTNAME_LABEL_ALPHABET,
  HOSTNAME_SUFFIX_ATTEMPTS,
  HOSTNAME_SUFFIX_LENGTH,
  WILDCARD_PROBE_LABEL_LENGTH,
} from 'src/engine/core-modules/dns-resolver/constants/available-hostname-search.constant';
import {
  DnsResolverException,
  DnsResolverExceptionCode,
} from 'src/engine/core-modules/dns-resolver/exceptions/dns-resolver.exception';
import { DnsResolverService } from 'src/engine/core-modules/dns-resolver/services/dns-resolver.service';
import { type HostnameAvailability } from 'src/engine/core-modules/dns-resolver/types/hostname-availability.type';

type FindAvailableHostnameArgs = {
  preferredPrefix: string;
  domain: string;
};

@Injectable()
export class AvailableHostnameService {
  constructor(private readonly dnsResolverService: DnsResolverService) {}

  async findAvailableHostnameOrThrow({
    preferredPrefix,
    domain,
  }: FindAvailableHostnameArgs): Promise<string> {
    const preferredHostname = `${preferredPrefix}.${domain}`;

    if (await this.answersEveryLabel(domain)) {
      return preferredHostname;
    }

    for (const candidate of this.buildCandidates(preferredPrefix, domain)) {
      const availability =
        await this.dnsResolverService.checkHostnameAvailability(candidate);

      if (this.isUsable(availability)) {
        return candidate;
      }
    }

    throw new DnsResolverException(
      `Every candidate hostname for prefix ${preferredPrefix} on ${domain} is already in use`,
      DnsResolverExceptionCode.NO_AVAILABLE_HOSTNAME,
      {
        userFriendlyMessage: msg`No available subdomain could be found on ${domain}. Please contact support.`,
      },
    );
  }

  private buildCandidates(preferredPrefix: string, domain: string): string[] {
    const suffixedPrefixes = Array.from(
      { length: HOSTNAME_SUFFIX_ATTEMPTS },
      () =>
        `${preferredPrefix}${this.buildRandomLabel(HOSTNAME_SUFFIX_LENGTH)}`,
    );

    return [preferredPrefix, ...suffixedPrefixes].map(
      (prefix) => `${prefix}.${domain}`,
    );
  }

  private async answersEveryLabel(domain: string): Promise<boolean> {
    const probeHostname = `${this.buildRandomLabel(WILDCARD_PROBE_LABEL_LENGTH)}.${domain}`;

    return (
      (await this.dnsResolverService.checkHostnameAvailability(
        probeHostname,
      )) === 'OCCUPIED'
    );
  }

  private isUsable(availability: HostnameAvailability): boolean {
    switch (availability) {
      case 'AVAILABLE':
      case 'UNKNOWN':
        return true;
      case 'OCCUPIED':
        return false;
    }
  }

  private buildRandomLabel(length: number): string {
    return Array.from(
      { length },
      () => HOSTNAME_LABEL_ALPHABET[randomInt(HOSTNAME_LABEL_ALPHABET.length)],
    ).join('');
  }
}
