import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { buildUrlWithPathnameAndSearchParams } from 'src/engine/core-modules/domain/domain-server-config/utils/build-url-with-pathname-and-search-params.util';
import { WorkspaceDomainConfig } from 'src/engine/core-modules/domain/workspace-domains/types/workspace-domain-config.type';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

@Injectable()
export class WorkspaceDomainsService {
  constructor(
    private readonly domainServerConfigService: DomainServerConfigService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    // Request routing resolves workspace via the public domain registry.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(PublicDomainEntity)
    private readonly publicDomainRepository: Repository<PublicDomainEntity>,
  ) {}

  buildWorkspaceURL({
    workspace,
    pathname,
    searchParams,
  }: {
    workspace: WorkspaceDomainConfig;
    pathname?: string;
    searchParams?: Record<string, string | number | boolean>;
  }) {
    const workspaceUrls = this.getWorkspaceUrls(workspace);

    const url = buildUrlWithPathnameAndSearchParams({
      baseUrl: new URL(workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl),
      pathname,
      searchParams,
    });

    return url;
  }

  computeWorkspaceRedirectErrorUrl(
    errorMessage: string,
    workspace: WorkspaceDomainConfig,
    pathname: string,
  ) {
    const url = this.buildWorkspaceURL({
      workspace,
      pathname,
      searchParams: { errorMessage },
    });

    return url.toString();
  }

  private async getDefaultWorkspace() {
    if (this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')) {
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
        `${workspaces.length} workspaces found in database. In single-workspace mode, there should be only one workspace. The Apple seed workspace will be used as fallback if present.`,
      );
    }

    const foundWorkspace =
      workspaces.find(
        (workspace) => workspace.id === SEED_APPLE_WORKSPACE_ID,
      ) ?? workspaces[0];

    assertIsDefinedOrThrow(foundWorkspace, WorkspaceNotFoundDefaultError);

    return foundWorkspace;
  }

  async getWorkspaceByOriginOrDefaultWorkspace(origin: string) {
    const { workspace } = await this.resolveWorkspaceAndPublicDomain(origin);

    return workspace;
  }

  async resolveWorkspaceAndPublicDomain(origin: string): Promise<{
    workspace: WorkspaceEntity | undefined;
    publicDomain: PublicDomainEntity | null;
    // True when the request was served from an origin isolated from the main
    // Twenty app (a registered public domain or a *.<publicBase> subdomain),
    // where it is safe to relax the response/request header restrictions.
    isIsolatedOrigin: boolean;
  }> {
    const { subdomain, domain, isPublicDomainOrigin } =
      this.domainServerConfigService.getSubdomainAndDomainFromUrl(origin);

    if (!this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')) {
      // Single-workspace: workspace is always the default. Still resolve a
      // matching public domain so the route trigger can scope by application.
      const publicDomain = isDefined(domain)
        ? await this.publicDomainRepository.findOne({ where: { domain } })
        : null;

      return {
        workspace: await this.getDefaultWorkspace(),
        publicDomain: publicDomain ?? null,
        isIsolatedOrigin: isPublicDomainOrigin || isDefined(publicDomain),
      };
    }

    // Isolated public function domain (e.g. {workspaceSubdomain}.withtwenty.com).
    if (isPublicDomainOrigin) {
      const hostname = new URL(origin).hostname;

      // An explicitly registered public domain (possibly application-scoped)
      // takes precedence over the default per-workspace function subdomain.
      const registeredPublicDomain = await this.publicDomainRepository.findOne({
        where: { domain: hostname },
        relations: ['workspace', 'workspace.workspaceSSOIdentityProviders'],
      });

      if (isDefined(registeredPublicDomain)) {
        return {
          workspace: registeredPublicDomain.workspace ?? undefined,
          publicDomain: registeredPublicDomain,
          isIsolatedOrigin: true,
        };
      }

      const workspaceFromSubdomain = isDefined(subdomain)
        ? ((await this.workspaceRepository.findOne({
            where: { subdomain },
            relations: ['workspaceSSOIdentityProviders'],
          })) ?? undefined)
        : undefined;

      return {
        workspace: workspaceFromSubdomain,
        publicDomain: null,
        isIsolatedOrigin: true,
      };
    }

    if (!domain && !subdomain) {
      return {
        workspace: undefined,
        publicDomain: null,
        isIsolatedOrigin: false,
      };
    }

    const where = isDefined(domain) ? { customDomain: domain } : { subdomain };

    const workspaceFromCustomDomainOrSubdomain =
      (await this.workspaceRepository.findOne({
        where,
        relations: ['workspaceSSOIdentityProviders'],
      })) ?? undefined;

    if (isDefined(workspaceFromCustomDomainOrSubdomain) || !isDefined(domain)) {
      return {
        workspace: workspaceFromCustomDomainOrSubdomain,
        publicDomain: null,
        isIsolatedOrigin: false,
      };
    }

    const publicDomain = await this.publicDomainRepository.findOne({
      where: { domain },
      relations: ['workspace', 'workspace.workspaceSSOIdentityProviders'],
    });

    return {
      workspace: publicDomain?.workspace ?? undefined,
      publicDomain: publicDomain ?? null,
      isIsolatedOrigin: isDefined(publicDomain),
    };
  }

  // Builds the canonical isolated URL of a logic function route, e.g.
  // https://{workspaceSubdomain}.withtwenty.com/my-route. Returns undefined
  // when no public domain base is configured (self-hosting).
  buildPublicFunctionUrl({
    workspace,
    path,
  }: {
    workspace: Pick<WorkspaceEntity, 'subdomain'>;
    path: string;
  }): string | undefined {
    const publicBaseHostname =
      this.domainServerConfigService.getPublicBaseHostnameOrUndefined();

    if (!isNonEmptyString(publicBaseHostname)) {
      return undefined;
    }

    const url = this.domainServerConfigService.getPublicDomainUrl();

    url.hostname = `${workspace.subdomain}.${publicBaseHostname}`;
    url.pathname = path.startsWith('/') ? path : `/${path}`;

    return url.toString();
  }

  private getCustomWorkspaceUrl(customDomain: string) {
    const url = this.domainServerConfigService.getFrontUrl();

    url.hostname = customDomain;

    return url.toString();
  }

  private getTwentyWorkspaceUrl(subdomain: string) {
    const url = this.domainServerConfigService.getFrontUrl();

    url.hostname = this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')
      ? `${subdomain}.${url.hostname}`
      : url.hostname;

    return url.toString();
  }

  getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
    workspace?: WorkspaceDomainConfig | null,
  ) {
    if (!workspace) {
      return {
        subdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
        customDomain: null,
        isCustomDomainEnabled: false,
      };
    }

    if (!workspace.isCustomDomainEnabled) {
      return {
        subdomain: workspace.subdomain,
        customDomain: null,
        isCustomDomainEnabled: false,
      };
    }

    return workspace;
  }

  getWorkspaceUrls({
    subdomain,
    customDomain,
    isCustomDomainEnabled,
  }: WorkspaceDomainConfig) {
    return {
      customUrl:
        isCustomDomainEnabled && customDomain
          ? this.getCustomWorkspaceUrl(customDomain)
          : undefined,
      subdomainUrl: this.getTwentyWorkspaceUrl(subdomain),
    };
  }

  async findByCustomDomain(customDomain: string) {
    return this.workspaceRepository.findOne({ where: { customDomain } });
  }
}
