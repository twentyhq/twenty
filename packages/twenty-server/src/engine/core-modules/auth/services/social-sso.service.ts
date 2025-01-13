import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class SocialSsoService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  private getAuthProviderColumnNameByProvider(
    authProvider: WorkspaceAuthProvider,
  ) {
    if (authProvider === 'google') {
      return 'isGoogleAuthEnabled';
    }

    if (authProvider === 'microsoft') {
      return 'isMicrosoftAuthEnabled';
    }

    if (authProvider === 'password') {
      return 'isPasswordAuthEnabled';
    }

    throw new Error(`${authProvider} is not a valid auth provider.`);
  }

  async findWorkspaceFromOriginAndAuthProvider(
    origin: string,
    {
      authProvider,
      email,
    }: { authProvider: WorkspaceAuthProvider; email: string },
  ) {
    if (
      this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
      new URL(this.domainManagerService.getBaseUrl()).origin === origin
    ) {
      // Multi-workspace enable mode but on non workspace url.
      // so get the first workspace with the current auth method enable
      const workspace = await this.workspaceRepository.findOne({
        where: {
          [this.getAuthProviderColumnNameByProvider(authProvider)]: true,
          workspaceUsers: {
            user: {
              email,
            },
          },
        },
        relations: ['workspaceUsers', 'workspaceUsers.user'],
      });

      return workspace ?? undefined;
    }

    return await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
      origin,
    );
  }
}
