import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { Repository } from 'typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class WorkspaceImpersonationService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
  ) {}

  async impersonateWorkspaceUser({
    workspaceId,
    impersonatorUserWorkspaceId,
    targetUserWorkspaceId,
  }: {
    workspaceId: string;
    impersonatorUserWorkspaceId: string;
    targetUserWorkspaceId: string;
  }): Promise<AuthTokens> {
    return await this.impersonateCore({
      workspaceId,
      impersonatorUserWorkspaceId,
      resolveTarget: async () =>
        await this.userWorkspaceRepository.findOne({
          where: { id: targetUserWorkspaceId },
        }),
    });
  }

  async impersonateWorkspaceUserByMemberId({
    workspaceId,
    impersonatorUserWorkspaceId,
    targetWorkspaceMemberId,
  }: {
    workspaceId: string;
    impersonatorUserWorkspaceId: string;
    targetWorkspaceMemberId: string;
  }): Promise<AuthTokens> {
    return await this.impersonateCore({
      workspaceId,
      impersonatorUserWorkspaceId,
      resolveTarget: async () => {
        const workspaceMemberRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
          );
        const workspaceMember = await workspaceMemberRepository.findOne({
          where: { id: targetWorkspaceMemberId },
        });

        if (!workspaceMember) return null;

        return await this.userWorkspaceRepository.findOne({
          where: { userId: workspaceMember.userId, workspaceId },
        });
      },
    });
  }

  private async impersonateCore({
    workspaceId,
    impersonatorUserWorkspaceId,
    resolveTarget,
  }: {
    workspaceId: string;
    impersonatorUserWorkspaceId: string;
    resolveTarget: () => Promise<UserWorkspace | null>;
  }): Promise<AuthTokens> {
    const target = await resolveTarget();

    if (!target || target.workspaceId !== workspaceId) {
      throw new AuthException(
        'User workspace not found in current workspace',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const impersonatorUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: { id: impersonatorUserWorkspaceId },
      });

    if (
      impersonatorUserWorkspace &&
      impersonatorUserWorkspace.userId === target.userId
    ) {
      throw new AuthException(
        'Cannot impersonate yourself',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const roleTargetWithRole = await this.roleTargetsRepository
      .createQueryBuilder('rt')
      .innerJoinAndSelect('rt.role', 'role')
      .leftJoinAndSelect('role.permissionFlags', 'permissionFlags')
      .where('rt.userWorkspaceId = :userWorkspaceId', {
        userWorkspaceId: impersonatorUserWorkspaceId,
      })
      .andWhere('rt.workspaceId = :workspaceId', { workspaceId })
      .getOne();

    const hasImpersonatePermission =
      !!roleTargetWithRole &&
      this.permissionsService.checkRolePermissions(
        (roleTargetWithRole as RoleTargetsEntity & { role: RoleEntity }).role,
        PermissionFlagType.IMPERSONATE,
      );

    if (!hasImpersonatePermission) {
      throw new AuthException(
        'Forbidden',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const { userId: targetUserId, id: targetUserWorkspaceId } = target;
    const impersonatorUserId = impersonatorUserWorkspace?.userId ?? null;
    const correlationId = randomUUID();

    const analytics = this.auditService.createContext({
      workspaceId,
      userId: impersonatorUserId,
    });

    await analytics.insertWorkspaceEvent('Monitoring', {
      eventName: 'workspace.impersonation.attempted',
      message: `correlationId=${correlationId}; impersonatorUserWorkspaceId=${impersonatorUserWorkspaceId}; targetUserWorkspaceId=${targetUserWorkspaceId}; workspaceId=${workspaceId}`,
    });

    const accessToken = await this.accessTokenService.generateAccessToken({
      userId: targetUserId,
      workspaceId,
      authProvider: AuthProviderEnum.Impersonation,
      isImpersonating: true,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId: targetUserWorkspaceId,
    });
    const refreshToken = await this.refreshTokenService.generateRefreshToken({
      userId: targetUserId,
      workspaceId,
      authProvider: AuthProviderEnum.Impersonation,
      targetedTokenType: JwtTokenTypeEnum.ACCESS,
      isImpersonating: true,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId: targetUserWorkspaceId,
    });

    await analytics.insertWorkspaceEvent('Monitoring', {
      eventName: 'workspace.impersonation.issued',
      message: `correlationId=${correlationId}; impersonatorUserWorkspaceId=${impersonatorUserWorkspaceId}; targetUserWorkspaceId=${targetUserWorkspaceId}; workspaceId=${workspaceId}`,
    });

    return {
      tokens: {
        accessOrWorkspaceAgnosticToken: accessToken,
        refreshToken,
      },
    };
  }
}
