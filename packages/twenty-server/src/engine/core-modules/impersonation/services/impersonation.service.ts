import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { MONITORING_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/monitoring/monitoring';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class ImpersonationService {
  constructor(
    private readonly auditService: AuditService,
    private readonly domainManagerService: DomainManagerService,
    private readonly loginTokenService: LoginTokenService,
    @InjectRepository(User)
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
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
        relations: ['user', 'workspace'],
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

    if (
      isServerLevelImpersonation &&
      toImpersonateUserWorkspace.workspace.allowImpersonation !== true
    ) {
      throw new AuthException(
        'Impersonation not enabled for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const auditService = this.auditService.createContext({
      workspaceId: impersonatorUserWorkspace.workspace.id,
      userId: impersonatorUserWorkspace.user.id,
    });

    await auditService.insertWorkspaceEvent(MONITORING_EVENT, {
      eventName: `${isServerLevelImpersonation ? 'server' : 'workspace'}.impersonation.attempt`,
      message: `Impersonation attempt: targetUserId=${toImpersonateUserWorkspace.user.id}, workspaceId=${workspaceId}, impersonatorUserId=${impersonatorUserWorkspace.user.id}`,
    });

    try {
      await auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `${isServerLevelImpersonation ? 'server' : 'workspace'}.impersonation.login_token_attempt`,
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

      await auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `${isServerLevelImpersonation ? 'server' : 'workspace'}.impersonation.login_token_generated`,
        message: `Impersonation token generated successfully for user ${toImpersonateUserWorkspace.user.id}`,
      });

      return {
        workspace: {
          id: toImpersonateUserWorkspace.workspace.id,
          workspaceUrls: this.domainManagerService.getWorkspaceUrls(
            toImpersonateUserWorkspace.workspace,
          ),
        },
        loginToken,
      };
    } catch {
      await auditService.insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `${isServerLevelImpersonation ? 'server' : 'workspace'}.impersonation.login_token_failed`,
        message: `Impersonation token generation failed for targetUserId=${toImpersonateUserWorkspace.user.id}`,
      });
      throw new AuthException(
        'Impersonation failed',
        AuthExceptionCode.INVALID_DATA,
      );
    }
  }
}
