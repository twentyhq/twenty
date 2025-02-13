/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import Cloudflare from 'cloudflare';
import { isDefined } from 'twenty-shared';

import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { domainManagerValidator } from 'src/engine/core-modules/domain-manager/validator/cloudflare.validate';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

@Injectable()
export class CustomDomainService {
  cloudflareClient?: Cloudflare;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
  ) {
    if (this.environmentService.get('CLOUDFLARE_API_KEY')) {
      this.cloudflareClient = new Cloudflare({
        apiToken: this.environmentService.get('CLOUDFLARE_API_KEY'),
      });
    }
  }

  async registerCustomDomain(customDomain: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (isDefined(await this.getCustomDomainDetails(customDomain))) {
      throw new DomainManagerException(
        'Hostname already registered',
        DomainManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED,
      );
    }

    return await this.cloudflareClient.customHostnames.create({
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
      hostname: customDomain,
      ssl: {
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
      },
    });
  }

  async getCustomDomainDetails(
    customDomain: string,
  ): Promise<CustomDomainValidRecords | undefined> {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const response = await this.cloudflareClient.customHostnames.list({
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
      hostname: customDomain,
    });

    if (response.result.length === 0) {
      return undefined;
    }

    if (response.result.length === 1) {
      return {
        id: response.result[0].id,
        customDomain: response.result[0].hostname,
        records: [
          response.result[0].ownership_verification,
          ...(response.result[0].ssl?.validation_records ?? []),
        ]
          .map<CustomDomainValidRecords['records'][0] | undefined>(
            (record: Record<string, string>) => {
              if (!record) return;

              if (
                'txt_name' in record &&
                'txt_value' in record &&
                record.txt_name &&
                record.txt_value
              ) {
                return {
                  validationType: 'ssl' as const,
                  type: 'txt' as const,
                  status: response.result[0].ssl.status ?? 'pending',
                  key: record.txt_name,
                  value: record.txt_value,
                };
              }

              if (
                'type' in record &&
                record.type === 'txt' &&
                record.value &&
                record.name
              ) {
                return {
                  validationType: 'ownership' as const,
                  type: 'txt' as const,
                  status: response.result[0].status ?? 'pending',
                  key: record.name,
                  value: record.value,
                };
              }
            },
          )
          .filter(isDefined)
          .concat([
            {
              validationType: 'redirection' as const,
              type: 'cname' as const,
              status:
                response.result[0].verification_errors?.[0] ===
                'custom hostname does not CNAME to this zone.'
                  ? 'error'
                  : 'success',
              key: response.result[0].hostname,
              value: this.domainManagerService.getFrontUrl().hostname,
            },
          ]),
      };
    }

    // should never append. error 5xx
    throw new Error('More than one custom hostname found in cloudflare');
  }

  async updateCustomDomain(fromHostname: string, toHostname: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const fromCustomHostname = await this.getCustomDomainDetails(fromHostname);

    if (fromCustomHostname) {
      await this.deleteCustomHostname(fromCustomHostname.id);
    }

    return this.registerCustomDomain(toHostname);
  }

  async deleteCustomHostnameByHostnameSilently(customDomain: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    try {
      const customHostname = await this.getCustomDomainDetails(customDomain);

      if (customHostname) {
        await this.cloudflareClient.customHostnames.delete(customHostname.id, {
          zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
        });
      }
    } catch (err) {
      return;
    }
  }

  async deleteCustomHostname(customHostnameId: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.delete(customHostnameId, {
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
    });
  }

  isCustomDomainWorking(customDomainDetails: CustomDomainValidRecords) {
    return customDomainDetails.records.every(
      ({ status }) => status === 'success',
    );
  }
}
