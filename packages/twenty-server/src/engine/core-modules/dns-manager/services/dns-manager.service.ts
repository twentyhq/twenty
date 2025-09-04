/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import Cloudflare from 'cloudflare';
import { type CustomHostnameCreateParams } from 'cloudflare/resources/custom-hostnames/custom-hostnames';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { RedirectRule } from 'cloudflare/resources/rulesets/rules';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { dnsManagerValidator } from 'src/engine/core-modules/dns-manager/validator/cloudflare.validate';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type HostnameValidRecords } from 'src/engine/core-modules/dns-manager/dtos/hostname-valid-records';

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

  async registerHostname(customDomain: string) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (isDefined(await this.getHostnameDetails(customDomain))) {
      throw new DnsManagerException(
        'Hostname already registered',
        DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED,
        { userFriendlyMessage: 'Hostname already registered' },
      );
    }

    return this.cloudflareClient.customHostnames.create({
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
      hostname: customDomain,
      ssl: this.sslParams,
    });
  }

  private async getOrCreateRuleset(zoneId: string) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const rulesetPhase = 'http_request_dynamic_redirect';

    const phaseEntry = await this.cloudflareClient.rulesets.phases.get(
      rulesetPhase,
      {
        zone_id: zoneId,
      },
    );

    try {
      return await this.cloudflareClient.rulesets.get(phaseEntry.id, {
        zone_id: zoneId,
      });
    } catch {
      return this.cloudflareClient.rulesets.create({
        zone_id: zoneId,
        phase: rulesetPhase,
        kind: 'root',
        name: 'Public hostnames redirect',
        description: 'Redirect public hostnames to base domain with /s prefix',
        rules: [],
      });
    }
  }

  private getRedirectRuleId(publicDomain: string) {
    return `public-domain-redirect-rule-${publicDomain}`;
  }

  async registerRedirectRule(publicDomain: string) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (!isDefined(await this.getHostnameDetails(publicDomain))) {
      throw new DnsManagerException(
        'Hostname should be registered',
        DnsManagerExceptionCode.HOSTNAME_NOT_REGISTERED,
        { userFriendlyMessage: 'Hostname should be registered' },
      );
    }

    if (publicDomain !== publicDomain.trim().toLowerCase()) {
      throw new DnsManagerException(
        'publicDomain should be trimmed and lowercase',
        DnsManagerExceptionCode.INVALID_INPUT_DATA,
        {
          userFriendlyMessage: t`publicDomain should be trimmed and lowercase`,
        },
      );
    }

    const zoneId = this.twentyConfigService.get('CLOUDFLARE_ZONE_ID');

    const ruleset = await this.getOrCreateRuleset(zoneId);

    const baseHost = this.domainManagerService.getBaseUrl().hostname;

    const expression = [
      `(http.host eq "${publicDomain}")`,
      `not starts_with(http.request.uri.path, "/.well-known/")`,
      `not starts_with(http.request.uri.path, "/cdn-cgi/")`,
    ].join(' and ');

    const targetExpression =
      `concat("https://${baseHost}/s", ` +
      `http.request.uri.path, ` +
      `if(len(http.request.uri.query) > 0, concat("?", http.request.uri.query), ""))`;

    const payload: RedirectRule = {
      action: 'redirect',
      id: this.getRedirectRuleId(publicDomain),
      enabled: true,
      expression,
      description: `PublicDomain → base /s (${publicDomain})`,
      action_parameters: {
        from_value: {
          status_code: 301,
          target_url: { expression: targetExpression },
        },
      },
      version: '1',
      last_updated: new Date().toISOString(),
    };

    await this.cloudflareClient.rulesets.rules.create(ruleset.id, payload);
  }

  async deleteRedirectRuleSilently(publicDomain: string): Promise<void> {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    try {
      const zoneId = this.twentyConfigService.get('CLOUDFLARE_ZONE_ID');

      const ruleset = await this.getOrCreateRuleset(zoneId);

      await this.cloudflareClient.rulesets.rules.delete(
        ruleset.id,
        this.getRedirectRuleId(publicDomain),
      );
    } catch {
      return;
    }
  }

  async getHostnameDetails(
    hostname: string,
  ): Promise<HostnameValidRecords | undefined> {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const response = await this.cloudflareClient.customHostnames.list({
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
      hostname: hostname,
    });

    if (response.result.length === 0) {
      return undefined;
    }

    if (response.result.length === 1) {
      const { hostname, id, ssl, verification_errors, created_at } =
        response.result[0];
      // @ts-expect-error - type definition doesn't reflect the real API
      const dcvRecords = ssl?.dcv_delegation_records?.[0];

      return {
        id: id,
        customDomain: hostname,
        records: [
          {
            validationType: 'redirection' as const,
            type: 'cname',
            status:
              // wait 10s before starting the real check
              created_at &&
              new Date().getTime() - new Date(created_at).getTime() < 1000 * 10
                ? 'pending'
                : verification_errors?.[0] ===
                    'custom hostname does not CNAME to this zone.'
                  ? 'error'
                  : 'success',
            key: hostname,
            value: this.domainManagerService.getBaseUrl().hostname,
          },
          {
            validationType: 'ssl' as const,
            type: 'cname',
            status:
              !ssl.status || ssl.status.startsWith('pending')
                ? 'pending'
                : ssl.status === 'active'
                  ? 'success'
                  : ssl.status,
            key: dcvRecords?.cname ?? `_acme-challenge.${hostname}`,
            value:
              dcvRecords?.cname_target ??
              `${hostname}.${this.twentyConfigService.get('CLOUDFLARE_DCV_DELEGATION_ID')}.dcv.cloudflare.com`,
          },
        ],
      };
    }

    // should never append. error 5xx
    throw new Error('More than one custom hostname found in cloudflare');
  }

  async updateHostname(fromHostname: string, toHostname: string) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const fromCustomHostname = await this.getHostnameDetails(fromHostname);

    if (fromCustomHostname) {
      await this.deleteHostname(fromCustomHostname.id);
    }

    return this.registerHostname(toHostname);
  }

  async deleteHostnameSilently(hostname: string) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    try {
      const customHostname = await this.getHostnameDetails(hostname);

      if (customHostname) {
        await this.cloudflareClient.customHostnames.delete(customHostname.id, {
          zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
        });
      }
    } catch {
      return;
    }
  }

  async deleteHostname(customHostnameId: string) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.delete(customHostnameId, {
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
    });
  }

  async refreshHostname(hostnameValidRecords: HostnameValidRecords) {
    dnsManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.edit(hostnameValidRecords.id, {
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
      ssl: this.sslParams,
    });
  }

  async isHostnameWorking(hostname: string) {
    const hostnameDetails = await this.getHostnameDetails(hostname);

    if (!isDefined(hostnameDetails)) {
      return false;
    }

    return hostnameDetails.records.every(({ status }) => status === 'success');
  }
}
