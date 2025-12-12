import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { MONITORING_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/monitoring/monitoring';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { twoFactorAuthenticationMethodsValidator } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.validation';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ImpersonationService {
  constructor(
    private readonly auditService: AuditService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly loginTokenService: LoginTokenService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async impersonate(
    toImpersonateUserId: string,
    workspaceId: string,
    impersonatorUserWorkspaceId: string,
  ) {
    const toImpersonateUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: {
          userId: toImpersonateUserId,
          workspaceId,
        },
        relations: ['user', 'workspace'],
      });

    const impersonatorUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: { id: impersonatorUserWorkspaceId },
        relations: ['user', 'workspace', 'twoFactorAuthenticationMethods'],
      });

    if (
      !isDefined(toImpersonateUserWorkspace) ||
      !isDefined(impersonatorUserWorkspace)
    ) {
      throw new AuthException(
        'User not found in workspace or impersonation not enabled',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const isServerLevelImpersonation =
      toImpersonateUserWorkspace.workspace.id !==
      impersonatorUserWorkspace.workspace.id;

    const hasServerLevelImpersonatePermission =
      impersonatorUserWorkspace.user.canImpersonate === true &&
      toImpersonateUserWorkspace.workspace.allowImpersonation === true;

    if (isServerLevelImpersonation) {
      if (!hasServerLevelImpersonatePermission) {
        throw new AuthException(
          'Impersonation not enabled for the impersonator user or the target workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      const isDevelopment =
        this.twentyConfigService.get('NODE_ENV') ===
        NodeEnvironment.DEVELOPMENT;

      if (isDevelopment) {
        return this.generateImpersonationLoginToken(
          impersonatorUserWorkspace,
          toImpersonateUserWorkspace,
          'server',
        );
      }

      const has2FAEnabled =
        twoFactorAuthenticationMethodsValidator.areDefined(
          impersonatorUserWorkspace.twoFactorAuthenticationMethods,
        ) &&
        twoFactorAuthenticationMethodsValidator.areVerified(
          impersonatorUserWorkspace.twoFactorAuthenticationMethods,
        );

      if (!has2FAEnabled) {
        throw new AuthException(
          'Two-factor authentication is required for server-level impersonation. Please enable 2FA in your workspace settings before attempting to impersonate users.',
          AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
        );
      }

      return this.generateImpersonationLoginToken(
        impersonatorUserWorkspace,
        toImpersonateUserWorkspace,
        'server',
      );
    }

    const hasWorkspaceLevelImpersonatePermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: impersonatorUserWorkspace.id,
        setting: PermissionFlagType.IMPERSONATE,
        workspaceId: workspaceId,
      });

    if (!hasWorkspaceLevelImpersonatePermission) {
      throw new AuthException(
        'Impersonation not enabled for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return this.generateImpersonationLoginToken(
      impersonatorUserWorkspace,
      toImpersonateUserWorkspace,
      'workspace',
    );
  }

  async generateImpersonationLoginToken(
    impersonatorUserWorkspace: UserWorkspaceEntity,
    toImpersonateUserWorkspace: UserWorkspaceEntity,
    impersonationLevel: 'server' | 'workspace',
  ) {
    const auditService = this.auditService.createContext({
      workspaceId: impersonatorUserWorkspace.workspace.id,
      userId: impersonatorUserWorkspace.user.id,
    });

    auditService.insertWorkspaceEvent(MONITORING_EVENT, {
      eventName: `${impersonationLevel}.impersonation.attempt`,
      message: `Impersonation attempt: targetUserId=${toImpersonateUserWorkspace.user.id}, workspaceId=${toImpersonateUserWorkspace.workspace.id}, impersonatorUserId=${impersonatorUserWorkspace.user.id}`,
    });

    try {
      auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `${impersonationLevel}.impersonation.login_token_attempt`,
        message: `Impersonation token generation attempt for user ${toImpersonateUserWorkspace.user.id}`,
      });

      const loginToken = await this.loginTokenService.generateLoginToken(
        toImpersonateUserWorkspace.user.email,
        toImpersonateUserWorkspace.workspace.id,
        AuthProviderEnum.Impersonation,
        {
          impersonatorUserWorkspaceId: impersonatorUserWorkspace.id,
        },
      );

      auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `${impersonationLevel}.impersonation.login_token_generated`,
        message: `Impersonation token generated successfully for user ${toImpersonateUserWorkspace.user.id}`,
      });

      return {
        workspace: {
          id: toImpersonateUserWorkspace.workspace.id,
          workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls(
            toImpersonateUserWorkspace.workspace,
          ),
        },
        loginToken,
      };
    } catch {
      auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `${impersonationLevel}.impersonation.login_token_failed`,
        message: `Impersonation token generation failed for targetUserId=${toImpersonateUserWorkspace.user.id}`,
      });
      throw new AuthException(
        'Impersonation failed',
        AuthExceptionCode.INVALID_DATA,
      );
    }
  }
}
