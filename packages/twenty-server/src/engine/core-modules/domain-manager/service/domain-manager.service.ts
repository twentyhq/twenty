import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { isDefined } from 'src/utils/is-defined';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
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
        relations: ['workspaceSSOIdentityProviders'],
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

      const workspace = await this.workspaceRepository.findOne({
        where: { subdomain },
        relations: ['workspaceSSOIdentityProviders'],
      });

      return workspace;
    } catch (e) {
      throw new WorkspaceException(
        'Workspace not found',
        WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND,
      );
    }
  }

  private generateRandomSubdomain(): string {
    const prefixes = [
      'cool',
      'smart',
      'fast',
      'bright',
      'shiny',
      'happy',
      'funny',
      'clever',
      'brave',
      'kind',
      'gentle',
      'quick',
      'sharp',
      'calm',
      'silent',
      'lucky',
      'fierce',
      'swift',
      'mighty',
      'noble',
      'bold',
      'wise',
      'eager',
      'joyful',
      'glad',
      'zany',
      'witty',
      'bouncy',
      'graceful',
      'colorful',
    ];
    const suffixes = [
      'raccoon',
      'panda',
      'whale',
      'tiger',
      'dolphin',
      'eagle',
      'penguin',
      'owl',
      'fox',
      'wolf',
      'lion',
      'bear',
      'hawk',
      'shark',
      'sparrow',
      'moose',
      'lynx',
      'falcon',
      'rabbit',
      'hedgehog',
      'monkey',
      'horse',
      'koala',
      'kangaroo',
      'elephant',
      'giraffe',
      'panther',
      'crocodile',
      'seal',
      'octopus',
    ];

    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${randomPrefix}-${randomSuffix}`;
  }

  private getSubdomainNameByEmail(email?: string) {
    if (!isDefined(email) || !isWorkEmail(email)) return;

    return getDomainNameByEmail(email);
  }

  private getSubdomainNameByDisplayName(displayName?: string) {
    if (!isDefined(displayName)) return;
    const displayNameWords = displayName.match(/(\w| |\d)+/g);

    if (displayNameWords) {
      return displayNameWords.join('-').replace(/ /g, '').toLowerCase();
    }
  }

  async generateSubdomain(params?: { email?: string; displayName?: string }) {
    const subdomain =
      this.getSubdomainNameByEmail(params?.email) ??
      this.getSubdomainNameByDisplayName(params?.displayName) ??
      this.generateRandomSubdomain();

    const existingWorkspaceCount = await this.workspaceRepository.countBy({
      subdomain,
    });

    return `${subdomain}${existingWorkspaceCount > 0 ? `-${Math.random().toString(36).substring(2, 10)}` : ''}`;
  }
}
