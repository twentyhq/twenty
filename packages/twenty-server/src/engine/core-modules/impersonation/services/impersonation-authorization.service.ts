import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { twoFactorAuthenticationMethodsValidator } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.validation';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

export type ImpersonationLevel = 'server' | 'workspace';

export type ImpersonationDenialReason =
  | 'SERVER_LEVEL_NOT_ALLOWED'
  | 'SERVER_LEVEL_2FA_REQUIRED'
  | 'WORKSPACE_LEVEL_NOT_ALLOWED'
  | 'TARGET_HAS_ADMIN_PRIVILEGES';

export type ImpersonationAuthorizationResult =
  | { allowed: true; level: ImpersonationLevel }
  | {
      allowed: false;
      level: ImpersonationLevel;
      reason: ImpersonationDenialReason;
    };

@Injectable()
export class ImpersonationAuthorizationService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

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

      if (
        this.isTwoFactorRequiredForServerLevelImpersonation() &&
        !this.hasVerifiedTwoFactorAuthentication(impersonatorUserWorkspace)
      ) {
        return { allowed: false, level, reason: 'SERVER_LEVEL_2FA_REQUIRED' };
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

  private isTwoFactorRequiredForServerLevelImpersonation(): boolean {
    return (
      this.twentyConfigService.get('NODE_ENV') !== NodeEnvironment.DEVELOPMENT
    );
  }

  private hasVerifiedTwoFactorAuthentication(
    impersonatorUserWorkspace: UserWorkspaceEntity,
  ): boolean {
    return (
      twoFactorAuthenticationMethodsValidator.areDefined(
        impersonatorUserWorkspace.twoFactorAuthenticationMethods,
      ) &&
      twoFactorAuthenticationMethodsValidator.areVerified(
        impersonatorUserWorkspace.twoFactorAuthenticationMethods,
      )
    );
  }
}
