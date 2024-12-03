import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { isDefined } from 'src/utils/is-defined';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class DomainManagerService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
  ) {}

  getBaseUrl() {
    const baseUrl = new URL(
      `${this.environmentService.get('FRONT_PROTOCOL')}://${this.environmentService.get('FRONT_DOMAIN')}`,
    );

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      this.environmentService.get('DEFAULT_SUBDOMAIN')
    ) {
      baseUrl.hostname = `${this.environmentService.get('DEFAULT_SUBDOMAIN')}.${baseUrl.hostname}`;
    }

    if (this.environmentService.get('FRONT_PORT')) {
      baseUrl.port = this.environmentService.get('FRONT_PORT').toString();
    }

    return baseUrl;
  }

  buildWorkspaceURL({
    subdomain,
    pathname,
    searchParams,
  }: {
    subdomain?: string;
    pathname?: string;
    searchParams?: Record<string, string | number>;
  }) {
    const url = this.getBaseUrl();

    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      !subdomain
    ) {
      throw new Error('subdomain is required when multiworkspace is enable');
    }

    if (
      subdomain &&
      subdomain.length > 0 &&
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
    ) {
      url.hostname = url.hostname.replace(
        this.environmentService.get('DEFAULT_SUBDOMAIN'),
        subdomain,
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

  getWorkspaceSubdomainByOrigin = (origin: string) => {
    const { hostname: originHostname } = new URL(origin);

    const subdomain = originHostname.replace(
      `.${this.environmentService.get('FRONT_DOMAIN')}`,
      '',
    );

    if (this.isDefaultSubdomain(subdomain)) {
      return;
    }

    return subdomain;
  };

  isDefaultSubdomain(subdomain: string) {
    return subdomain === this.environmentService.get('DEFAULT_SUBDOMAIN');
  }

  computeRedirectErrorUrl({
    errorMessage,
    subdomain,
  }: {
    errorMessage: string;
    subdomain?: string;
  }) {
    const url = this.buildWorkspaceURL({
      subdomain,
      pathname: '/verify',
      searchParams: { errorMessage },
    });

    return url.toString();
  }

  async getDefaultWorkspace() {
    if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      const workspaces = await this.workspaceRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });

      if (workspaces.length > 1) {
        // TODO AMOREAUX: this logger is trigger twice and the second time the message is undefined for an unknown reason
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

  async getWorkspaceByOrigin(origin: string) {
    try {
      if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
        return this.getDefaultWorkspace();
      }

      const subdomain = this.getWorkspaceSubdomainByOrigin(origin);

      if (!isDefined(subdomain)) return;

      return this.workspaceRepository.findOneBy({ subdomain });
    } catch (e) {
      throw new WorkspaceException(
        'Workspace not found',
        WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND,
      );
    }
  }
}
