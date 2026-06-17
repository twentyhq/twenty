import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { IMPERSONATION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/impersonation/impersonation';
import { IMPERSONATION_DENIAL_EXCEPTION_CODE_BY_REASON } from 'src/engine/core-modules/impersonation/constants/impersonation-denial-exception-code-by-reason.constant';
import { IMPERSONATION_DENIAL_EXCEPTION_MESSAGE_BY_REASON } from 'src/engine/core-modules/impersonation/constants/impersonation-denial-exception-message-by-reason.constant';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class ImpersonationService {
  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly loginTokenService: LoginTokenService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly impersonationAuthorizationService: ImpersonationAuthorizationService,
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

    if (
      toImpersonateUserWorkspace.userId === impersonatorUserWorkspace.userId
    ) {
      throw new AuthException(
        'User cannot impersonate themselves',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const authorizationResult =
      await this.impersonationAuthorizationService.checkImpersonationAuthorization(
        impersonatorUserWorkspace,
        toImpersonateUserWorkspace,
      );

    if (!authorizationResult.allowed) {
      throw new AuthException(
        IMPERSONATION_DENIAL_EXCEPTION_MESSAGE_BY_REASON[
          authorizationResult.reason
        ],
        IMPERSONATION_DENIAL_EXCEPTION_CODE_BY_REASON[
          authorizationResult.reason
        ],
      );
    }

    return this.generateImpersonationLoginToken(
      impersonatorUserWorkspace,
      toImpersonateUserWorkspace,
      authorizationResult.level,
    );
  }

  async generateImpersonationLoginToken(
    impersonatorUserWorkspace: UserWorkspaceEntity,
    toImpersonateUserWorkspace: UserWorkspaceEntity,
    impersonationLevel: 'server' | 'workspace',
  ) {
    const eventLogContext = this.eventLogEmitterService.createContext({
      workspaceId: impersonatorUserWorkspace.workspace.id,
      userId: impersonatorUserWorkspace.userId,
    });

    void eventLogContext.insertWorkspaceEvent(IMPERSONATION_EVENT, {
      level: impersonationLevel,
      action: 'attempt',
      message: `Impersonation attempt: targetUserId=${toImpersonateUserWorkspace.user.id}, workspaceId=${toImpersonateUserWorkspace.workspace.id}, impersonatorUserId=${impersonatorUserWorkspace.user.id}`,
    });

    try {
      void eventLogContext.insertWorkspaceEvent(IMPERSONATION_EVENT, {
        level: impersonationLevel,
        action: 'login_token_attempt',
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

      void eventLogContext.insertWorkspaceEvent(IMPERSONATION_EVENT, {
        level: impersonationLevel,
        action: 'login_token_generated',
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
      void eventLogContext.insertWorkspaceEvent(IMPERSONATION_EVENT, {
        level: impersonationLevel,
        action: 'login_token_failed',
        message: `Impersonation token generation failed for targetUserId=${toImpersonateUserWorkspace.user.id}`,
      });
      throw new AuthException(
        'Impersonation failed',
        AuthExceptionCode.INVALID_DATA,
      );
    }
  }
}
