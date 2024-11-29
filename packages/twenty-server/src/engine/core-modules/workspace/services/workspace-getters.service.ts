/* eslint-disable @nx/workspace-inject-workspace-repository */
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { isDefined } from 'src/utils/is-defined';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UrlManagerService } from 'src/engine/core-modules/url-manager/service/url-manager.service';

@Injectable()
export class WorkspaceGettersService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
    private readonly urlManagerService: UrlManagerService,
  ) {}

  async getAuthProvidersByWorkspaceId(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
      relations: ['workspaceSSOIdentityProviders'],
    });

    workspaceValidator.assertIsExist(
      workspace,
      new WorkspaceException(
        'Workspace not found',
        WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    return {
      google: workspace.isGoogleAuthEnabled,
      magicLink: false,
      password: workspace.isPasswordAuthEnabled,
      microsoft: workspace.isMicrosoftAuthEnabled,
      sso: workspace.workspaceSSOIdentityProviders.map((identityProvider) => ({
        id: identityProvider.id,
        name: identityProvider.name,
        type: identityProvider.type,
        status: identityProvider.status,
        issuer: identityProvider.issuer,
      })),
    };
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

      const subdomain =
        this.urlManagerService.getWorkspaceSubdomainByOrigin(origin);

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
