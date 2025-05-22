import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class AuthSsoService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
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

  private filterWorkspacesOnAuthProvider(
    workspaces: Array<Workspace>,
    authProvider: WorkspaceAuthProvider,
  ) {
    return workspaces.filter(
      (workspace) =>
        workspace[this.getAuthProviderColumnNameByProvider(authProvider)],
    );
  }

  async findWorkspaceFromWorkspaceIdOrAuthProvider(
    {
      authProvider,
      email,
    }: { authProvider: WorkspaceAuthProvider; email: string },
    workspaceId?: string,
  ) {
    if (
      this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED') &&
      !workspaceId
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
        relations: [
          'workspaceUsers',
          'workspaceUsers.user',
          'approvedAccessDomains',
        ],
      });

      return workspace ?? undefined;
    }

    return await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
      relations: ['approvedAccessDomains'],
    });
  }
}
