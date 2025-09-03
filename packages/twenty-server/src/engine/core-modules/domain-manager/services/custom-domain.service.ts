/* @license Enterprise */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Cloudflare from 'cloudflare';
import { type CustomHostnameCreateParams } from 'cloudflare/resources/custom-hostnames/custom-hostnames';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { t } from '@lingui/core/macro';
import { RedirectRule } from 'cloudflare/resources/rulesets/rules';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { type CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { domainManagerValidator } from 'src/engine/core-modules/domain-manager/validator/cloudflare.validate';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class CustomDomainService {
  cloudflareClient?: Cloudflare;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
    private readonly auditService: AuditService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
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

  async registerCustomDomain(customDomain: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (isDefined(await this.getCustomDomainDetails(customDomain))) {
      throw new DomainManagerException(
        'Hostname already registered',
        DomainManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED,
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
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

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
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (!isDefined(await this.getCustomDomainDetails(publicDomain))) {
      throw new DomainManagerException(
        'Hostname should be registered',
        DomainManagerExceptionCode.HOSTNAME_NOT_REGISTERED,
        { userFriendlyMessage: 'Hostname should be registered' },
      );
    }

    if (publicDomain !== publicDomain.trim().toLowerCase()) {
      throw new DomainManagerException(
        'publicDomain should be trimmed and lowercase',
        DomainManagerExceptionCode.INVALID_INPUT_DATA,
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
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

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

  async getCustomDomainDetails(
    customDomain: string,
  ): Promise<CustomDomainValidRecords | undefined> {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const response = await this.cloudflareClient.customHostnames.list({
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
      hostname: customDomain,
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
          zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
        });
      }
    } catch {
      return;
    }
  }

  async deleteCustomHostname(customHostnameId: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.delete(customHostnameId, {
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
    });
  }

  private async refreshCustomDomain(
    customDomainDetails: CustomDomainValidRecords,
  ) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    await this.cloudflareClient.customHostnames.edit(customDomainDetails.id, {
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
      ssl: this.sslParams,
    });
  }

  async checkCustomDomainValidRecords(workspace: Workspace) {
    if (!workspace.customDomain) return;

    const customDomainDetails = await this.getCustomDomainDetails(
      workspace.customDomain,
    );

    if (!customDomainDetails) return;

    await this.refreshCustomDomain(customDomainDetails);

    const isCustomDomainWorking =
      this.domainManagerService.isCustomDomainWorking(customDomainDetails);

    if (workspace.isCustomDomainEnabled !== isCustomDomainWorking) {
      workspace.isCustomDomainEnabled = isCustomDomainWorking;

      await this.workspaceRepository.save(workspace);

      const analytics = this.auditService.createContext({
        workspaceId: workspace.id,
      });

      analytics.insertWorkspaceEvent(
        workspace.isCustomDomainEnabled
          ? CUSTOM_DOMAIN_ACTIVATED_EVENT
          : CUSTOM_DOMAIN_DEACTIVATED_EVENT,
        {},
      );
    }

    return customDomainDetails;
  }
}
