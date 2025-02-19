import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared';

import { CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { generateRandomSubdomain } from 'src/engine/core-modules/domain-manager/utils/generate-random-subdomain';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-from-email';
import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain-manager/utils/get-subdomain-name-from-display-name';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType } from 'src/engine/core-modules/domain-manager/domain-manager.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class DomainManagerService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
  ) {}

  getFrontUrl() {
    return new URL(
      this.environmentService.get('FRONTEND_URL') ??
        this.environmentService.get('SERVER_URL'),
    );
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
    workspace,
  }: {
    emailVerificationToken: string;
    email: string;
    workspace: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType;
  }) {
    return this.buildWorkspaceURL({
      workspace,
      pathname: 'verify-email',
      searchParams: { emailVerificationToken, email },
    });
  }

  buildWorkspaceURL({
    workspace,
    pathname,
    searchParams,
  }: {
    workspace: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType;
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    const workspaceUrls = this.getWorkspaceUrls(workspace);

    const url = new URL(workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl);

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

  getSubdomainAndCustomDomainFromUrl = (url: string) => {
    const { hostname: originHostname } = new URL(url);

    const frontDomain = this.getFrontUrl().hostname;

    const isFrontdomain = originHostname.endsWith(`.${frontDomain}`);

    const subdomain = originHostname.replace(`.${frontDomain}`, '');

    return {
      subdomain:
        isFrontdomain && !this.isDefaultSubdomain(subdomain)
          ? subdomain
          : undefined,
      customDomain: isFrontdomain ? null : originHostname,
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

  computeRedirectErrorUrl(
    errorMessage: string,
    workspace: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType,
  ) {
    const url = this.buildWorkspaceURL({
      workspace,
      pathname: '/verify',
      searchParams: { errorMessage },
    });

    return url.toString();
  }

  private async getDefaultWorkspace() {
    if (this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      throw new Error(
        'Default workspace does not exist when multi-workspace is enabled',
      );
    }

    const workspaces = await this.workspaceRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['workspaceSSOIdentityProviders'],
    });

    if (workspaces.length > 1) {
      Logger.warn(
        ` ${workspaces.length} workspaces found in database. In single-workspace mode, there should be only one workspace. Apple seed workspace will be used as fallback if it found.`,
      );
    }

    const foundWorkspace =
      workspaces.length === 1
        ? workspaces[0]
        : workspaces.filter(
            (workspace) => workspace.id === SEED_APPLE_WORKSPACE_ID,
          )?.[0];

    workspaceValidator.assertIsDefinedOrThrow(foundWorkspace);

    return foundWorkspace;
  }

  async getWorkspaceByOriginOrDefaultWorkspace(origin: string) {
    if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      return this.getDefaultWorkspace();
    }

    const { subdomain, customDomain } =
      this.getSubdomainAndCustomDomainFromUrl(origin);

    if (!customDomain && !subdomain) return;

    const where = isDefined(customDomain) ? { customDomain } : { subdomain };

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

  private getCustomWorkspaceUrl(customDomain: string) {
    const url = this.getFrontUrl();

    url.hostname = customDomain;

    return url.toString();
  }

  private getTwentyWorkspaceUrl(subdomain: string) {
    const url = this.getFrontUrl();

    url.hostname = this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
      ? `${subdomain}.${url.hostname}`
      : url.hostname;

    return url.toString();
  }

  getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
    workspace?: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType | null,
  ) {
    if (!workspace) {
      return {
        subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
        customDomain: null,
      };
    }

    if (!workspace.isCustomDomainEnabled) {
      return {
        subdomain: workspace.subdomain,
        customDomain: null,
      };
    }

    return workspace;
  }

  isCustomDomainWorking(customDomainDetails: CustomDomainValidRecords) {
    return customDomainDetails.records.every(
      ({ status }) => status === 'success',
    );
  }

  getWorkspaceUrls({
    subdomain,
    customDomain,
    isCustomDomainEnabled,
  }: WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType) {
    return {
      customUrl:
        isCustomDomainEnabled && customDomain
          ? this.getCustomWorkspaceUrl(customDomain)
          : undefined,
      subdomainUrl: this.getTwentyWorkspaceUrl(subdomain),
    };
  }
}
