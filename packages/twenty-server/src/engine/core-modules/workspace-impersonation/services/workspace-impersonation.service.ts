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
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
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
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

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

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId: impersonatorUserWorkspaceId,
      workspaceId,
    });

    if (!roleId) {
      throw new AuthException(
        'No role found for user workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const role = await this.roleService.getRoleById(roleId, workspaceId);

    if (!role) {
      throw new AuthException(
        'Role not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const hasImpersonatePermission =
      this.permissionsService.checkRolePermissions(
        role,
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
