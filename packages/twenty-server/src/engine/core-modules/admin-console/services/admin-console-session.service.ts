import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ADMIN_CONSOLE_LOGIN_TOKEN_PURPOSE } from 'src/engine/core-modules/admin-console/constants/admin-console-login-token-purpose.constant';
import { type AdminConsoleLoginTokenDTO } from 'src/engine/core-modules/admin-console/dtos/admin-console-login-token.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { SERVER_ADMIN_ACTION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/server-admin/server-admin-action';
import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

// Session cookies are host-only, so the admin console gets its own session through a
// single-use login token minted from the admin's workspace session.
@Injectable()
export class AdminConsoleSessionService {
  constructor(
    private readonly serverAdminAccessService: ServerAdminAccessService,
    private readonly loginTokenService: LoginTokenService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userSessionService: UserSessionService,
    private readonly eventLogEmitterService: EventLogEmitterService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async createLoginToken({
    user,
    workspaceId,
    authProvider,
  }: {
    user: UserEntity;
    workspaceId: string;
    authProvider: AuthProviderEnum;
  }): Promise<AdminConsoleLoginTokenDTO> {
    const adminConsoleUrl = this.serverAdminAccessService.getAdminConsoleUrl();

    if (!isDefined(adminConsoleUrl)) {
      throw new AuthException(
        'Admin console is not configured',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (!userHasAdminPrivileges(user)) {
      throw new AuthException(
        'User has no server administration privileges',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const { token } = await this.loginTokenService.generateLoginToken(
      user.email,
      workspaceId,
      authProvider,
      { purpose: ADMIN_CONSOLE_LOGIN_TOKEN_PURPOSE },
    );

    return { loginToken: token, adminConsoleUrl: adminConsoleUrl.origin };
  }

  async signIn({
    loginToken,
    request,
  }: {
    loginToken: string;
    request: Request;
  }): Promise<void> {
    if (!this.serverAdminAccessService.isRequestOnAdminConsoleHost(request)) {
      throw new AuthException(
        'Admin console sign-in is only available on the admin console host',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const loginTokenPayload = await this.loginTokenService.verifyLoginToken(
      loginToken,
      { purpose: ADMIN_CONSOLE_LOGIN_TOKEN_PURPOSE },
    );

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspaceId: loginTokenPayload.workspaceId,
        user: { email: loginTokenPayload.sub },
      },
      relations: { user: true },
    });

    if (
      !isDefined(userWorkspace) ||
      userWorkspace.user.disabled === true ||
      !userHasAdminPrivileges(userWorkspace.user) ||
      !(await this.serverAdminAccessService.isRequestAllowed(
        request,
        userWorkspace.user.email,
      ))
    ) {
      throw new AuthException(
        'Admin console sign-in refused',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`You are not allowed to open the admin console.`,
        },
      );
    }

    await this.loginTokenService.consumeLoginTokenOrThrow(loginTokenPayload);

    const tokenSubject = {
      userId: userWorkspace.userId,
      workspaceId: userWorkspace.workspaceId,
      authProvider: loginTokenPayload.authProvider,
    };

    const accessToken =
      await this.accessTokenService.generateAccessToken(tokenSubject);
    const refreshToken = await this.refreshTokenService.generateRefreshToken({
      ...tokenSubject,
      targetedTokenType: JwtTokenTypeEnum.ACCESS,
    });

    await this.userSessionService.issueSessionForTokenPair({
      tokenPair: { accessOrWorkspaceAgnosticToken: accessToken, refreshToken },
      request,
      origin: 'sign_in',
    });

    void this.eventLogEmitterService
      .createContext({
        workspaceId: userWorkspace.workspaceId,
        userId: userWorkspace.userId,
      })
      .insertWorkspaceEvent(SERVER_ADMIN_ACTION_EVENT, {
        operation: 'signInToAdminConsole',
        operationType: 'mutation',
        outcome: 'success',
        targetIds: {},
      });
  }
}
