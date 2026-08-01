import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query } from '@nestjs/graphql';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserSessionDTO } from 'src/engine/core-modules/user-session/dtos/user-session.dto';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import {
  type UserSessionEntity,
  UserSessionRevokedReason,
} from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/user-session-token.util';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver()
export class UserSessionResolver {
  constructor(
    private readonly userSessionService: UserSessionService,
    private readonly userSessionCookieService: UserSessionCookieService,
  ) {}

  @Query(() => [UserSessionDTO])
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async currentUserSessions(
    @AuthUser() user: AuthContextUser,
    @Context() context: { req: Request },
  ): Promise<UserSessionDTO[]> {
    const sessions = await this.userSessionService.findActiveSessionsForUser(
      user.id,
    );

    const presentedSessionToken =
      this.userSessionCookieService.extractSessionTokenFromRequest(context.req);
    const presentedTokenHash = isDefined(presentedSessionToken)
      ? hashUserSessionToken(presentedSessionToken)
      : undefined;

    return sessions.map((session) =>
      this.toUserSessionDTO(session, presentedTokenHash),
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async revokeUserSession(
    @AuthUser() user: AuthContextUser,
    @Args('userSessionId', { type: () => UUIDScalarType })
    userSessionId: string,
    @Context() context: { req: Request },
  ): Promise<boolean> {
    // Resolved before revoking: afterwards the session is no longer active and
    // would not be found, so the cookie would never be cleared.
    const currentSession = await this.resolveCurrentSession(context.req, user);

    const revoked = await this.userSessionService.revokeSessionByIdForUser({
      sessionId: userSessionId,
      userId: user.id,
      reason: UserSessionRevokedReason.UserRevoked,
    });

    // Revoking the device you are on: drop the cookie now instead of leaving
    // the browser holding a token that is already dead.
    if (
      revoked &&
      currentSession?.id === userSessionId &&
      isDefined(context.req.res)
    ) {
      this.userSessionCookieService.clearSessionCookie(context.req.res);
    }

    return revoked;
  }

  // Only a session that is genuinely usable counts as the current one: a
  // revoked or expired cookie must not decide which sessions survive.
  private async resolveCurrentSession(
    request: Request,
    user: AuthContextUser,
  ): Promise<UserSessionEntity | undefined> {
    const presentedSessionToken =
      this.userSessionCookieService.extractSessionTokenFromRequest(request);

    if (!isDefined(presentedSessionToken)) {
      return undefined;
    }

    const activeSessions =
      await this.userSessionService.findActiveSessionsForUser(user.id);
    const presentedTokenHash = hashUserSessionToken(presentedSessionToken);

    return activeSessions.find(
      (session) => session.tokenHash === presentedTokenHash,
    );
  }

  @Mutation(() => Int)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async revokeAllOtherUserSessions(
    @AuthUser() user: AuthContextUser,
    @Context() context: { req: Request },
  ): Promise<number> {
    const currentSession = await this.resolveCurrentSession(context.req, user);

    return await this.userSessionService.revokeAllSessionsForUser({
      userId: user.id,
      reason: UserSessionRevokedReason.UserRevoked,
      exceptSessionId: currentSession?.id,
    });
  }

  private toUserSessionDTO(
    session: UserSessionEntity,
    presentedTokenHash: string | undefined,
  ): UserSessionDTO {
    return {
      id: session.id,
      workspaceId: session.workspaceId,
      authProvider: session.authProvider,
      isImpersonating: session.isImpersonating,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      isCurrent: session.tokenHash === presentedTokenHash,
    };
  }
}
