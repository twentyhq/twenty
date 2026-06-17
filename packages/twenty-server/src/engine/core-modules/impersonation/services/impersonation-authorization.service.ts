import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

export type ImpersonationLevel = 'server' | 'workspace';

// Denial reasons are intentionally decoupled from user-facing messages so each
// call site (token generation, token exchange, request validation) can keep its
// own existing message, exception code and logging behavior.
export type ImpersonationDenialReason =
  | 'SERVER_LEVEL_NOT_ALLOWED'
  | 'WORKSPACE_LEVEL_NOT_ALLOWED'
  | 'TARGET_HAS_ADMIN_PRIVILEGES';

export type ImpersonationAuthorizationResult =
  | { allowed: true; level: ImpersonationLevel }
  | {
      allowed: false;
      level: ImpersonationLevel;
      reason: ImpersonationDenialReason;
    };

// Single source of truth for the impersonation authorization decision (level
// detection, server/workspace-level permission, admin-privilege guard). This
// logic was previously duplicated across impersonation.service.ts (token
// generation), auth.resolver.ts (token exchange) and jwt.auth.strategy.ts
// (per-request validation), which is how a check could silently drift between
// them.
//
// Operates on already-loaded UserWorkspaceEntity objects (both must have their
// `user` and `workspace` relations populated). Identity concerns
// (self-impersonation, not-found) and per-context concerns (2FA, dev
// short-circuit, event logging, JWT payload shape) remain the responsibility of
// the callers, because they intentionally differ between call sites.
@Injectable()
export class ImpersonationAuthorizationService {
  constructor(private readonly permissionsService: PermissionsService) {}

  getImpersonationLevel(
    impersonatorUserWorkspace: UserWorkspaceEntity,
    targetUserWorkspace: UserWorkspaceEntity,
  ): ImpersonationLevel {
    return targetUserWorkspace.workspace.id !==
      impersonatorUserWorkspace.workspace.id
      ? 'server'
      : 'workspace';
  }

  async checkImpersonationAuthorization(
    impersonatorUserWorkspace: UserWorkspaceEntity,
    targetUserWorkspace: UserWorkspaceEntity,
  ): Promise<ImpersonationAuthorizationResult> {
    const level = this.getImpersonationLevel(
      impersonatorUserWorkspace,
      targetUserWorkspace,
    );

    if (level === 'server') {
      const hasServerLevelImpersonatePermission =
        impersonatorUserWorkspace.user.canImpersonate === true &&
        targetUserWorkspace.workspace.allowImpersonation === true;

      if (!hasServerLevelImpersonatePermission) {
        return { allowed: false, level, reason: 'SERVER_LEVEL_NOT_ALLOWED' };
      }

      return { allowed: true, level };
    }

    const hasWorkspaceLevelImpersonatePermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: impersonatorUserWorkspace.id,
        setting: PermissionFlagType.IMPERSONATE,
        workspaceId: targetUserWorkspace.workspace.id,
      });

    if (!hasWorkspaceLevelImpersonatePermission) {
      return { allowed: false, level, reason: 'WORKSPACE_LEVEL_NOT_ALLOWED' };
    }

    if (
      userHasAdminPrivileges(targetUserWorkspace.user) &&
      !userHasAdminPrivileges(impersonatorUserWorkspace.user)
    ) {
      return { allowed: false, level, reason: 'TARGET_HAS_ADMIN_PRIVILEGES' };
    }

    return { allowed: true, level };
  }
}
