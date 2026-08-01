import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { IMPERSONATION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/impersonation/impersonation';
import { IMPERSONATION_DENIAL_BY_REASON } from 'src/engine/core-modules/impersonation/constants/impersonation-denial-by-reason.constant';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/user-session.entity';
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
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userSessionService: UserSessionService,
    private readonly userSessionCookieService: UserSessionCookieService,
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
      const { message, exceptionCode, userFriendlyMessage } =
        IMPERSONATION_DENIAL_BY_REASON[authorizationResult.reason];

      throw new AuthException(message, exceptionCode, { userFriendlyMessage });
    }

    return this.generateImpersonationLoginToken(
      impersonatorUserWorkspace,
      toImpersonateUserWorkspace,
      authorizationResult.level,
    );
  }

  // Ends a cookie-mode impersonation: revokes the impersonation session and,
  // for same-workspace impersonation, restores the impersonator with a fresh
  // session on the same origin. Cross-workspace impersonation runs in a
  // separate tab whose admin session on the admin origin was never touched,
  // so no restore session is minted there.
  async stopImpersonation({
    impersonationContext,
    workspaceId,
    request,
  }: {
    impersonationContext: AuthContext['impersonationContext'];
    workspaceId: string;
    request: Request;
  }): Promise<{ canRestoreImpersonatorSession: boolean }> {
    if (!isDefined(impersonationContext)) {
      throw new AuthException(
        'Not currently impersonating',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const impersonatorUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: { id: impersonationContext.impersonatorUserWorkspaceId },
        relations: ['user', 'workspace'],
      });

    if (!isDefined(impersonatorUserWorkspace)) {
      throw new AuthException(
        'Impersonator user workspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const presentedSessionToken =
      this.userSessionCookieService.extractSessionTokenFromRequest(request);

    if (isDefined(presentedSessionToken)) {
      await this.userSessionService.revokeSessionByToken(
        presentedSessionToken,
        UserSessionRevokedReason.ImpersonationEnded,
      );
    }

    const eventLogContext = this.eventLogEmitterService.createContext({
      workspaceId,
      userId: impersonatorUserWorkspace.userId,
    });

    void eventLogContext.insertWorkspaceEvent(IMPERSONATION_EVENT, {
      level: 'workspace',
      action: 'ended',
      message: `Impersonation ended by impersonatorUserWorkspaceId=${impersonationContext.impersonatorUserWorkspaceId}; workspaceId=${workspaceId}`,
    });

    // Ending impersonation only ever drops the impersonation credential. It
    // deliberately does not mint one for the impersonator: the request is
    // authenticated by a credential that authorizes the impersonated user,
    // and treating that as proof of the impersonator's identity would turn a
    // stolen impersonation cookie into an administrator session. The
    // impersonator signs in again, exactly as they do without cookie
    // sessions.
    if (isDefined(request.res)) {
      this.userSessionCookieService.clearSessionCookie(request.res);
    }

    return { canRestoreImpersonatorSession: false };
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
