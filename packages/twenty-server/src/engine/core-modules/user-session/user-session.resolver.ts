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
import { extractUserSessionTokenFromRequestCookie } from 'src/engine/core-modules/user-session/utils/extract-user-session-token-from-request.util';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/user-session-token.util';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver()
export class UserSessionResolver {
  constructor(private readonly userSessionService: UserSessionService) {}

  @Query(() => [UserSessionDTO])
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async currentUserSessions(
    @AuthUser() user: AuthContextUser,
    @Context() context: { req: Request },
  ): Promise<UserSessionDTO[]> {
    const sessions = await this.userSessionService.findActiveSessionsForUser(
      user.id,
    );

    const presentedSessionToken = extractUserSessionTokenFromRequestCookie(
      context.req,
    );
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
  ): Promise<boolean> {
    return await this.userSessionService.revokeSessionByIdForUser({
      sessionId: userSessionId,
      userId: user.id,
      reason: UserSessionRevokedReason.UserRevoked,
    });
  }

  @Mutation(() => Int)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async revokeAllOtherUserSessions(
    @AuthUser() user: AuthContextUser,
    @Context() context: { req: Request },
  ): Promise<number> {
    const presentedSessionToken = extractUserSessionTokenFromRequestCookie(
      context.req,
    );

    const currentSession = isDefined(presentedSessionToken)
      ? await this.userSessionService.findSessionByToken(presentedSessionToken)
      : null;

    // A stale cookie can reference another user's session: it must never
    // shape which of the authenticated user's sessions survive.
    const exceptSessionId =
      currentSession?.userId === user.id ? currentSession.id : undefined;

    return await this.userSessionService.revokeAllSessionsForUser({
      userId: user.id,
      reason: UserSessionRevokedReason.UserRevoked,
      exceptSessionId,
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
