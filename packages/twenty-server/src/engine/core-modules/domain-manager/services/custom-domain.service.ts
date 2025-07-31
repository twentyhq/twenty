/* @license Enterprise */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Cloudflare from 'cloudflare';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { CustomHostnameCreateParams } from 'cloudflare/resources/custom-hostnames/custom-hostnames';

import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { domainManagerValidator } from 'src/engine/core-modules/domain-manager/validator/cloudflare.validate';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';

@Injectable()
export class CustomDomainService {
  cloudflareClient?: Cloudflare;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
    private readonly auditService: AuditService,
    @InjectRepository(Workspace, 'core')
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

    return await this.cloudflareClient.customHostnames.create({
      zone_id: this.twentyConfigService.get('CLOUDFLARE_ZONE_ID'),
      hostname: customDomain,
      ssl: this.sslParams,
    });
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
    } catch (err) {
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
