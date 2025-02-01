import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Cloudflare from 'cloudflare';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared';

import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { CustomHostnameDetails } from 'src/engine/core-modules/domain-manager/dtos/custom-hostname-details';
import { generateRandomSubdomain } from 'src/engine/core-modules/domain-manager/utils/generate-random-subdomain';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-from-email';
import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-name-from-display-name';
import { domainManagerValidator } from 'src/engine/core-modules/domain-manager/validator/cloudflare.validate';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class DomainManagerService {
  cloudflareClient?: Cloudflare;

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
  ) {
    if (this.environmentService.get('CLOUDFLARE_API_KEY')) {
      this.cloudflareClient = new Cloudflare({
        apiToken: this.environmentService.get('CLOUDFLARE_API_KEY'),
      });
    }
  }

  getFrontUrl() {
    let baseUrl: URL;
    const frontPort = this.environmentService.get('FRONT_PORT');
    const frontDomain = this.environmentService.get('FRONT_DOMAIN');
    const frontProtocol = this.environmentService.get('FRONT_PROTOCOL');

    const serverUrl = this.environmentService.get('SERVER_URL');

    if (!frontDomain) {
      baseUrl = new URL(serverUrl);
    } else {
      baseUrl = new URL(`${frontProtocol}://${frontDomain}`);
    }

    if (frontPort) {
      baseUrl.port = frontPort.toString();
    }

    if (frontProtocol) {
      baseUrl.protocol = frontProtocol;
    }

    return baseUrl;
  }

  getBaseUrl(): URL {
    const baseUrl = this.getFrontUrl();

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      this.environmentService.get('DEFAULT_SUBDOMAIN')
    ) {
      baseUrl.hostname = `${this.environmentService.get('DEFAULT_SUBDOMAIN')}.${baseUrl.hostname}`;
    }

    return baseUrl;
  }

  buildEmailVerificationURL({
    emailVerificationToken,
    email,
    subdomain,
  }: {
    emailVerificationToken: string;
    email: string;
    subdomain: string;
  }) {
    return this.buildWorkspaceURL({
      subdomain,
      pathname: 'verify-email',
      searchParams: { emailVerificationToken, email },
    });
  }

  buildWorkspaceURL({
    subdomain,
    pathname,
    searchParams,
  }: {
    subdomain: string;
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    const url = this.getFrontUrl();

    if (this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      url.hostname = `${subdomain}.${url.hostname}`;
    }

    if (pathname) {
      url.pathname = pathname;
    }

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (isDefined(value)) {
          url.searchParams.set(key, value.toString());
        }
      });
    }

    return url;
  }

  // @Deprecated
  getWorkspaceSubdomainFromUrl = (url: string) => {
    const { hostname: originHostname } = new URL(url);

    if (!originHostname.endsWith(this.getFrontUrl().hostname)) {
      return null;
    }

    const frontDomain = this.getFrontUrl().hostname;

    const subdomain = originHostname.replace(`.${frontDomain}`, '');

    return this.isDefaultSubdomain(subdomain) ? null : subdomain;
  };

  getSubdomainAndHostnameFromUrl = (url: string) => {
    const { hostname: originHostname } = new URL(url);

    const frontDomain = this.getFrontUrl().hostname;

    const isFrontdomain = originHostname.endsWith(`.${frontDomain}`);

    const subdomain = originHostname.replace(`.${frontDomain}`, '');

    return {
      subdomain:
        isFrontdomain && !this.isDefaultSubdomain(subdomain)
          ? subdomain
          : undefined,
      hostname: isFrontdomain ? undefined : originHostname,
    };
  };

  async getWorkspaceBySubdomainOrDefaultWorkspace(subdomain?: string) {
    return subdomain
      ? await this.workspaceRepository.findOne({
          where: { subdomain },
        })
      : await this.getDefaultWorkspace();
  }

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.environmentService.get('DEFAULT_SUBDOMAIN');
  }

  computeRedirectErrorUrl(errorMessage: string, subdomain: string) {
    const url = this.buildWorkspaceURL({
      subdomain: subdomain,
      pathname: '/verify',
      searchParams: { errorMessage },
    });

    return url.toString();
  }

  private async getDefaultWorkspace() {
    if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      const defaultWorkspaceSubDomain =
        this.environmentService.get('DEFAULT_SUBDOMAIN');

      if (isDefined(defaultWorkspaceSubDomain)) {
        const foundWorkspaceForDefaultSubDomain =
          await this.workspaceRepository.findOne({
            where: { subdomain: defaultWorkspaceSubDomain },
            relations: ['workspaceSSOIdentityProviders'],
          });

        if (isDefined(foundWorkspaceForDefaultSubDomain)) {
          return foundWorkspaceForDefaultSubDomain;
        }
      }

      const workspaces = await this.workspaceRepository.find({
        order: {
          createdAt: 'DESC',
        },
        relations: ['workspaceSSOIdentityProviders'],
      });

      if (workspaces.length > 1) {
        Logger.warn(
          `In single-workspace mode, there should be only one workspace. Today there are ${workspaces.length} workspaces`,
        );
      }

      return workspaces[0];
    }

    throw new Error(
      'Default workspace not exist when multi-workspace is enabled',
    );
  }

  async getWorkspaceByOriginOrDefaultWorkspace(origin: string) {
    if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      return this.getDefaultWorkspace();
    }

    const { subdomain, hostname } = this.getSubdomainAndHostnameFromUrl(origin);

    if (!hostname && !subdomain) return;

    const where = isDefined(hostname) ? { hostname } : { subdomain };

    return (
      (await this.workspaceRepository.findOne({
        where,
        relations: ['workspaceSSOIdentityProviders'],
      })) ?? undefined
    );
  }

  private extractSubdomain(params?: { email?: string; displayName?: string }) {
    if (params?.email) {
      return getSubdomainFromEmail(params.email);
    }

    if (params?.displayName) {
      return getSubdomainNameFromDisplayName(params.displayName);
    }
  }

  async generateSubdomain(params?: { email?: string; displayName?: string }) {
    const subdomain =
      this.extractSubdomain(params) ?? generateRandomSubdomain();

    const existingWorkspaceCount = await this.workspaceRepository.countBy({
      subdomain,
    });

    return `${subdomain}${existingWorkspaceCount > 0 ? `-${Math.random().toString(36).substring(2, 10)}` : ''}`;
  }

  async registerCustomHostname(hostname: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    if (await this.getCustomHostnameDetails(hostname)) {
      throw new DomainManagerException(
        'Hostname already registered',
        DomainManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED,
      );
    }

    return await this.cloudflareClient.customHostnames.create({
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
      hostname,
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

  async getCustomHostnameDetails(
    hostname: string,
  ): Promise<CustomHostnameDetails | undefined> {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const response = await this.cloudflareClient.customHostnames.list({
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
      hostname,
    });

    if (response.result.length === 0) {
      return undefined;
    }

    if (response.result.length === 1) {
      return {
        id: response.result[0].id,
        hostname: response.result[0].hostname,
        status: response.result[0].status,
        ownershipVerifications: [
          response.result[0].ownership_verification,
          response.result[0].ownership_verification_http,
        ].reduce(
          (acc, ownershipVerification) => {
            if (!ownershipVerification) return acc;

            if (
              'http_body' in ownershipVerification &&
              'http_url' in ownershipVerification &&
              ownershipVerification.http_body &&
              ownershipVerification.http_url
            ) {
              acc.push({
                type: 'http',
                body: ownershipVerification.http_body,
                url: ownershipVerification.http_url,
              });
            }

            if (
              'type' in ownershipVerification &&
              ownershipVerification.type === 'txt' &&
              ownershipVerification.value &&
              ownershipVerification.name
            ) {
              acc.push({
                type: 'txt',
                value: ownershipVerification.value,
                name: ownershipVerification.name,
              });
            }

            return acc;
          },
          [] as CustomHostnameDetails['ownershipVerifications'],
        ),
      };
    }

    // should never append. error 5xx
    throw new Error('More than one custom hostname found in cloudflare');
  }

  async updateCustomHostname(fromHostname: string, toHostname: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    const fromCustomHostname =
      await this.getCustomHostnameDetails(fromHostname);

    if (fromCustomHostname) {
      await this.deleteCustomHostname(fromCustomHostname.id);
    }

    return await this.registerCustomHostname(toHostname);
  }

  async deleteCustomHostnameByHostnameSilently(hostname: string) {
    domainManagerValidator.isCloudflareInstanceDefined(this.cloudflareClient);

    try {
      const customHostname = await this.getCustomHostnameDetails(hostname);

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

    return this.cloudflareClient.customHostnames.delete(customHostnameId, {
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
    });
  }
}
