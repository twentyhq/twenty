import { InjectRepository } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';

import { Repository, IsNull } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceInvitationService {
  private tokenService: TokenService;
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private moduleRef: ModuleRef,
  ) {}

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

  onModuleInit() {
    this.tokenService = this.moduleRef.get(TokenService, { strict: false });
  }

  async createWorkspaceInvitation(email: string, workspace: Workspace) {
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
    // return (await this.invitationRepository
    //   .createQueryBuilder('invitation')
    //   .leftJoin(
    //     AppToken,
    //     'appToken',
    //     'invitation.id = "appToken"."invitationId"',
    //   )
    //   .where('"appToken"."workspaceId" = :workspaceId', {
    //     workspaceId: workspace.id,
    //   })
    //   .andWhere('"appToken".type = :type', {
    //     type: AppTokenType.InvitationToken,
    //   })
    //   .select([
    //     'invitation.id as id',
    //     `"appToken".context->'email' AS email`,
    //     '"appToken"."expiresAt" AS "expiresAt"',
    //   ])
    //   .getRawMany()) as unknown as Array<WorkspaceInvitation>;
  }

  async deleteWorkspaceInvitation(appTokenId: string, workspaceId: string) {
    // const invitation = await this.invitationRepository
    //   .createQueryBuilder('invitation')
    //   .leftJoinAndSelect(
    //     AppToken,
    //     'appToken',
    //     'invitation.id = "appToken"."invitationId"',
    //   )
    //   .where('invitation.id = :invitationId', { invitationId })
    //   .andWhere('"appToken"."workspaceId" = :workspaceId', {
    //     workspaceId,
    //   })
    //   .andWhere('"appToken".type = :type', {
    //     type: AppTokenType.InvitationToken,
    //   })
    //   .select(['"appToken".id as "appTokenId"'])
    //   .getRawOne();

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

    appToken.deletedAt = new Date();
    await this.appTokenRepository.save(appToken);

    return 'success';
  }
}
