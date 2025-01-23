import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import Cloudflare from 'cloudflare';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { isDefined } from 'src/utils/is-defined';
import { domainManagerValidator } from 'src/engine/core-modules/domain-manager/validator/cloudflare.validate';
import { CustomHostname } from 'src/engine/core-modules/domain-manager/types/custom-hostname.type';
import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { generateRandomSubdomain } from 'src/engine/core-modules/domain-manager/utils/generate-random-subdomain';
import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-name-from-display-name';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-from-email';

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
    workspaceSubdomainAndHostname,
  }: {
    emailVerificationToken: string;
    email: string;
    workspaceSubdomainAndHostname: Pick<Workspace, 'subdomain' | 'hostname'>;
  }) {
    return this.buildWorkspaceURL({
      workspaceSubdomainAndHostname: workspaceSubdomainAndHostname,
      pathname: 'verify-email',
      searchParams: { emailVerificationToken, email },
    });
  }

  buildWorkspaceURL({
    workspaceSubdomainAndHostname,
    pathname,
    searchParams,
  }: {
    workspaceSubdomainAndHostname?: Pick<Workspace, 'subdomain' | 'hostname'>;
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    const url = this.getBaseUrl();

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      !workspaceSubdomainAndHostname?.subdomain &&
      !workspaceSubdomainAndHostname?.hostname
    ) {
      throw new Error(
        'subdomain or hostname is required when multiworkspace is enable',
      );
    }

    if (workspaceSubdomainAndHostname?.hostname) {
      url.hostname = workspaceSubdomainAndHostname?.hostname;
    }

    if (
      !workspaceSubdomainAndHostname?.hostname &&
      workspaceSubdomainAndHostname?.subdomain &&
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
    ) {
      url.hostname = url.hostname.replace(
        this.environmentService.get('DEFAULT_SUBDOMAIN'),
        workspaceSubdomainAndHostname?.subdomain,
      );
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

  getSubdomainAndHostnameByOrigin = (origin: string) => {
    const { hostname: originHostname } = new URL(origin);

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

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.environmentService.get('DEFAULT_SUBDOMAIN');
  }

  computeRedirectErrorUrl(
    errorMessage: string,
    workspaceSubdomainAndHostname?: {
      subdomain?: string;
      hostname?: string;
    },
  ) {
    const url = this.buildWorkspaceURL({
      workspaceSubdomainAndHostname: {
        subdomain:
          workspaceSubdomainAndHostname?.subdomain ??
          this.environmentService.get('DEFAULT_SUBDOMAIN'),
        hostname: workspaceSubdomainAndHostname?.hostname,
      },
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

    const { subdomain, hostname } =
      this.getSubdomainAndHostnameByOrigin(origin);

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

  private async getCustomHostname(
    params: { hostnameName: string } | { hostname: CustomHostname },
  ) {
    return 'hostname' in params
      ? params.hostname
      : await this.getCustomHostnameDetails(params.hostnameName);
  }

  async registerCustomHostname(hostname: string) {
    domainManagerValidator.isExist(this.cloudflareClient);

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
  ): Promise<CustomHostname | undefined> {
    domainManagerValidator.isExist(this.cloudflareClient);

    const response = await this.cloudflareClient.customHostnames.list({
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
      hostname,
    });

    if (response.result.length === 0) {
      return undefined;
    }

    if (response.result.length === 1) {
      return response.result[0];
    }

    // should never append. error 5xx
    throw new Error('More than one custom hostname found in cloudflare');
  }

  async updateCustomHostname(
    fromHostname: { hostnameName: string } | { hostname: CustomHostname },
    toHostname: string,
  ) {
    domainManagerValidator.isExist(this.cloudflareClient);

    const fromCustomHostname = await this.getCustomHostname(fromHostname);

    if (fromCustomHostname) {
      await this.deleteCustomHostname(fromCustomHostname);
    }

    return this.registerCustomHostname(toHostname);
  }

  async deleteCustomHostnameByHostnameSilently(hostname: string) {
    domainManagerValidator.isExist(this.cloudflareClient);

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

  async deleteCustomHostname(customHostname: CustomHostname) {
    domainManagerValidator.isExist(this.cloudflareClient);

    return this.cloudflareClient.customHostnames.delete(customHostname.id, {
      zone_id: this.environmentService.get('CLOUDFLARE_ZONE_ID'),
    });
  }
}
