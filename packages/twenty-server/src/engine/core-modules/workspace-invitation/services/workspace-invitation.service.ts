import { InjectRepository } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';

import { Repository, IsNull } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceInvitationService {
  private tokenService: TokenService;
  private userWorkspaceService: UserWorkspaceService;
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.tokenService = this.moduleRef.get(TokenService, { strict: false });
    this.userWorkspaceService = this.moduleRef.get(UserWorkspaceService, {
      strict: false,
    });
  }

  private async getOneWorkspaceInvitation(workspaceId: string, email: string) {
    return await this.appTokenRepository
      .createQueryBuilder('appToken')
      .where('"appToken"."workspaceId" = :workspaceId', {
        workspaceId,
      })
      .andWhere('"appToken".type = :type', {
        type: AppTokenType.InvitationToken,
      })
      .andWhere('"appToken".context->>\'email\' = :email', { email })
      .getOne();
  }

  private appTokenToWorkspaceInvitation(appToken: AppToken) {
    if (appToken.type !== AppTokenType.InvitationToken) {
      throw new Error(`Token type must be "${AppTokenType.InvitationToken}"`);
    }

    if (!appToken.context?.email) {
      throw new Error(`Invitation corrupted: Missing email in context`);
    }

    return {
      id: appToken.id,
      email: appToken.context.email,
      expiresAt: appToken.expiresAt,
    };
  }

  async createWorkspaceInvitation(email: string, workspace: Workspace) {
    const maybeWorkspaceInvitation = await this.getOneWorkspaceInvitation(
      workspace.id,
      email,
    );

    if (maybeWorkspaceInvitation) {
      throw new Error(`${email} already invited`);
    }

    const isUserAlreadyInWorkspace =
      await this.userWorkspaceService.checkUserWorkspaceExistsByEmail(
        email,
        workspace.id,
      );

    if (isUserAlreadyInWorkspace) {
      throw new Error(`${email} is already in the workspace`);
    }

    return this.appTokenToWorkspaceInvitation(
      await this.tokenService.generateInvitationToken(workspace.id, email),
    );
  }

  async loadWorkspaceInvitations(workspace: Workspace) {
    const appTokens = await this.appTokenRepository.find({
      where: {
        workspaceId: workspace.id,
        type: AppTokenType.InvitationToken,
        deletedAt: IsNull(),
      },
      select: {
        value: false,
      },
    });

    if (!appTokens) {
      throw new Error('No invitation found');
    }

    return appTokens.map(this.appTokenToWorkspaceInvitation);
  }

  async deleteWorkspaceInvitation(appTokenId: string, workspaceId: string) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        id: appTokenId,
        workspaceId,
        type: AppTokenType.InvitationToken,
      },
    });

    if (!appToken) {
      return 'error';
    }

    await this.appTokenRepository.delete(appToken.id);

    return 'success';
  }

  async useWorkspaceInvitation(workspaceId: string, email: string) {
    const appToken = await this.getOneWorkspaceInvitation(workspaceId, email);

    if (appToken) {
      await this.appTokenRepository.delete(appToken.id);
    }
  }
}
