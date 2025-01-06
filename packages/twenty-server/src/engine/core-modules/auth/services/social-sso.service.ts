import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';

@Injectable()
export class SocialSsoService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
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
      const workspaceWithGoogleAuthActive =
        await this.workspaceRepository.findOne({
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

      if (workspaceWithGoogleAuthActive) {
        return workspaceWithGoogleAuthActive;
      }
    }

    return await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
      origin,
    );
  }

  async findOneInvitation(params: {
    workspaceId: string;
    email: string;
    inviteHash: string;
    personalInviteToken: string;
  }) {
    const qr = this.appTokenRepository.createQueryBuilder('appToken');

    if (params.inviteHash) {
      qr.leftJoinAndSelect('appToken.workspace', 'workspace').andWhere(
        'workspace.inviteHash = :inviteHash',
        {
          inviteHash: params.inviteHash,
        },
      );
    }

    qr.where('"appToken"."workspaceId" = :workspaceId', {
      workspaceId: params.workspaceId,
    })
      .andWhere('"appToken".type = :type', {
        type: AppTokenType.InvitationToken,
      })
      .andWhere('"appToken".context->>\'email\' = :email', {
        email: params.email,
      });

    if (params.personalInviteToken) {
      qr.andWhere('"appToken".context->>\'value\' = :personalInviteToken', {
        personalInviteToken: params.personalInviteToken,
      });
    }

    return await qr.getOne();
  }
}
