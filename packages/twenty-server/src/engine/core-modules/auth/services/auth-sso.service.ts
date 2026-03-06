import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AuthSsoService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private getAuthProviderColumnNameByProvider(authProvider: AuthProviderEnum) {
    if (authProvider === AuthProviderEnum.Google) {
      return 'isGoogleAuthEnabled';
    }

    if (authProvider === AuthProviderEnum.Microsoft) {
      return 'isMicrosoftAuthEnabled';
    }

    if (authProvider === AuthProviderEnum.Password) {
      return 'isPasswordAuthEnabled';
    }

    throw new Error(`${authProvider} is not a valid auth provider.`);
  }

  async findWorkspaceFromWorkspaceIdOrAuthProvider(
    { authProvider, email }: { authProvider: AuthProviderEnum; email: string },
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
