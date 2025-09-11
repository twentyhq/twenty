/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import Cloudflare from 'cloudflare';
import {
  type CustomHostnameCreateParams,
  type CustomHostnameListResponse,
} from 'cloudflare/resources/custom-hostnames/custom-hostnames';
import { isDefined } from 'twenty-shared/utils';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { dnsManagerValidator } from 'src/engine/core-modules/dns-manager/validator/cloudflare.validate';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';

type DnsManagerOptions = {
  isPublicDomain?: boolean;
};

@Injectable()
export class DnsManagerService {
  cloudflareClient?: Cloudflare;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
  ) {
    if (this.twentyConfigService.get('CLOUDFLARE_API_KEY')) {
      this.cloudflareClient = new Cloudflare({
        apiToken: this.twentyConfigService.get('CLOUDFLARE_API_KEY'),
      });
    }
  }

  async registerHostname(customDomain: string, options?: DnsManagerOptions) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (isDefined(await this.getHostnameId(customDomain, options))) {
      throw new DnsManagerException(
        'Hostname already registered',
        DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED,
        { userFriendlyMessage: 'Domain is already registered' },
      );
    }

    return this.cloudflareClient.customHostnames.create({
      zone_id: this.getZoneId(options),
      hostname: customDomain,
      ssl: this.sslParams,
    });
  }

  async getHostnameWithRecords(
    domain: string,
    options?: DnsManagerOptions,
  ): Promise<DomainValidRecords | undefined> {
    if (
      options?.isPublicDomain &&
      !isDefined(this.domainManagerService.getPublicDomainUrl().hostname)
    ) {
      throw new DnsManagerException(
        'Missing public domain URL',
        DnsManagerExceptionCode.MISSING_PUBLIC_DOMAIN_URL,
        {
          userFriendlyMessage:
            'Public domain URL is not defined. Please set the PUBLIC_DOMAIN_URL environment variable',
        },
      );
    }

    const customHostname = await this.getHostnameDetails(domain, options);

    if (!isDefined(customHostname)) {
      return undefined;
    }

    const { hostname, id, ssl } = customHostname;

    const statuses = this.getHostnameStatuses(customHostname);

    // @ts-expect-error - type definition doesn't reflect the real API
    const dcvRecords = ssl?.dcv_delegation_records?.[0];

    return {
      id: id,
      domain: hostname,
      records: [
        {
          validationType: 'redirection' as const,
          type: 'cname',
          status: statuses.redirection,
          key: hostname,
          value: options?.isPublicDomain
            ? this.domainManagerService.getPublicDomainUrl().hostname
            : this.domainManagerService.getBaseUrl().hostname,
        },
        {
          validationType: 'ssl' as const,
          type: 'cname',
          status: statuses.ssl,
          key: dcvRecords?.cname ?? `_acme-challenge.${hostname}`,
          value:
            dcvRecords?.cname_target ??
            `${hostname}.${this.twentyConfigService.get('CLOUDFLARE_DCV_DELEGATION_ID')}.dcv.cloudflare.com`,
        },
      ],
    };
  }

  async updateHostname(
    fromHostname: string,
    toHostname: string,
    options?: DnsManagerOptions,
  ) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const fromCustomHostnameId = await this.getHostnameId(
      fromHostname,
      options,
    );

    if (fromCustomHostnameId) {
      await this.deleteHostname(fromCustomHostnameId, options);
    }

    return this.registerHostname(toHostname, options);
  }

  async refreshHostname(
    domainValidRecords: DomainValidRecords,
    options?: DnsManagerOptions,
  ) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.edit(domainValidRecords.id, {
      zone_id: this.getZoneId(options),
      ssl: this.sslParams,
    });
  }

  async deleteHostnameSilently(hostname: string, options?: DnsManagerOptions) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    try {
      const customHostnameId = await this.getHostnameId(hostname, options);

      if (customHostnameId) {
        await this.deleteHostname(customHostnameId, options);
      }
    } catch {
      return;
    }
  }

  async isHostnameWorking(hostname: string, options?: DnsManagerOptions) {
    const hostnameDetails = await this.getHostnameDetails(hostname, options);

    if (!isDefined(hostnameDetails)) {
      return false;
    }

    const statuses = this.getHostnameStatuses(hostnameDetails);

    return statuses.redirection === 'success' && statuses.ssl === 'success';
  }

  private get sslParams(): CustomHostnameCreateParams['ssl'] {
    return {
      method: 'txt',
      type: 'dv',
      settings: {
        http2: 'on',
        min_tls_version: '1.2',
        tls_1_3: 'on',
        ciphers: ['ECDHE-RSA-AES128-GCM-SHA256', 'AES128-SHA'],
        early_hints: 'on',
      },
      bundle_method: 'ubiquitous',
      wildcard: false,
    };
  }

  private getZoneId(options?: DnsManagerOptions): string {
    return options?.isPublicDomain
      ? this.twentyConfigService.get('CLOUDFLARE_PUBLIC_DOMAIN_ZONE_ID')
      : this.twentyConfigService.get('CLOUDFLARE_ZONE_ID');
  }

  private async getHostnameDetails(
    hostname: string,
    options?: DnsManagerOptions,
  ) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const customHostnames = await this.cloudflareClient.customHostnames.list({
      zone_id: this.getZoneId(options),
      hostname: hostname,
    });

    if (customHostnames.result.length === 0) {
      return undefined;
    }

    if (customHostnames.result.length === 1) {
      return customHostnames.result[0];
    }

    // should never happen. error 5xx
    throw new DnsManagerException(
      'More than one custom hostname found in cloudflare',
      DnsManagerExceptionCode.MULTIPLE_HOSTNAMES_FOUND,
      {
        userFriendlyMessage: `${customHostnames.result.length} hostnames found for domain '${hostname}'. Expect 1`,
      },
    );
  }

  async getHostnameId(hostname: string, options?: DnsManagerOptions) {
    const customHostname = await this.getHostnameDetails(hostname, options);

    if (!isDefined(customHostname)) {
      return undefined;
    }

    return customHostname.id;
  }

  private getHostnameStatuses(customHostname: CustomHostnameListResponse) {
    const { ssl, verification_errors, created_at } = customHostname;

    return {
      // wait 10s before starting the real check
      redirection:
        created_at &&
        new Date().getTime() - new Date(created_at).getTime() < 1000 * 10
          ? 'pending'
          : verification_errors?.[0] ===
              'custom hostname does not CNAME to this zone.'
            ? 'error'
            : 'success',
      ssl:
        !ssl.status || ssl.status.startsWith('pending')
          ? 'pending'
          : ssl.status === 'active'
            ? 'success'
            : ssl.status,
    };
  }

  async deleteHostname(customHostnameId: string, options?: DnsManagerOptions) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.delete(customHostnameId, {
      zone_id: this.getZoneId(options),
    });
  }
}
