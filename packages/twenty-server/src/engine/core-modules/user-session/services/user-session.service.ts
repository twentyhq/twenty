import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, MoreThan, Not, Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/access-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type RefreshTokenJwtPayload } from 'src/engine/core-modules/auth/types/refresh-token-jwt-payload.type';
import { type WorkspaceAgnosticTokenJwtPayload } from 'src/engine/core-modules/auth/types/workspace-agnostic-token-jwt-payload.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { AUTH_SESSION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/auth-session/auth-session';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  UserSessionEntity,
  UserSessionRevokedReason,
} from 'src/engine/core-modules/user-session/user-session.entity';
import {
  type CachedUserSession,
  type CreateUserSessionInput,
} from 'src/engine/core-modules/user-session/types/user-session.type';
import {
  generateUserSessionToken,
  hashUserSessionToken,
} from 'src/engine/core-modules/user-session/utils/user-session-token.util';

export const USER_SESSION_CACHE_TTL_MS = 60 * 1000;
export const USER_SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

// Impersonation sessions keep today's short impersonation token lifetime.
const IMPERSONATION_SESSION_LIFETIME = '1d';

const buildInvalidSessionException = () =>
  new AuthException(
    'Session is invalid or has expired.',
    AuthExceptionCode.UNAUTHENTICATED,
  );

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly userSessionRepository: Repository<UserSessionEntity>,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorageService: CacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly eventLogEmitterService: EventLogEmitterService,
  ) {}

  async createSession(input: CreateUserSessionInput): Promise<{
    sessionToken: string;
    session: UserSessionEntity;
  }> {
    if (isDefined(input.workspaceId) && !isDefined(input.userWorkspaceId)) {
      throw new AuthException(
        'Cannot create a workspace session without a user workspace',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const lifetime =
      input.isImpersonating === true
        ? IMPERSONATION_SESSION_LIFETIME
        : this.twentyConfigService.get('SESSION_ABSOLUTE_LIFETIME');

    const now = new Date();
    const sessionToken = generateUserSessionToken();

    const session = await this.userSessionRepository.save(
      this.userSessionRepository.create({
        tokenHash: hashUserSessionToken(sessionToken),
        userId: input.userId,
        workspaceId: input.workspaceId ?? null,
        userWorkspaceId: input.userWorkspaceId ?? null,
        authProvider: input.authProvider,
        isImpersonating: input.isImpersonating === true,
        impersonatorUserWorkspaceId:
          input.isImpersonating === true
            ? (input.impersonatorUserWorkspaceId ?? null)
            : null,
        impersonatedUserWorkspaceId:
          input.isImpersonating === true
            ? (input.impersonatedUserWorkspaceId ?? null)
            : null,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        expiresAt: addMilliseconds(now, ms(lifetime)),
        lastActiveAt: now,
      }),
    );

    if (input.origin === 'sign_in' && isDefined(session.workspaceId)) {
      this.emitAuthSessionEvent(session, 'user_signed_in');
    }

    return { sessionToken, session };
  }

  // Returns the same payload shape the equivalent JWT would carry, so the
  // existing JwtAuthStrategy.validate dispatch builds the AuthContext.
  async resolveSessionPayload(
    sessionToken: string,
  ): Promise<AccessTokenJwtPayload | WorkspaceAgnosticTokenJwtPayload> {
    const tokenHash = hashUserSessionToken(sessionToken);

    const cachedSession =
      await this.cacheStorageService.get<CachedUserSession>(tokenHash);

    if (isDefined(cachedSession)) {
      if (!this.isCachedSessionActive(cachedSession)) {
        await this.cacheStorageService.del(tokenHash);

        throw buildInvalidSessionException();
      }

      await this.touchSessionIfDue(tokenHash, cachedSession);

      return this.buildPayloadFromCachedSession(cachedSession);
    }

    const session = await this.userSessionRepository.findOneBy({ tokenHash });

    if (!isDefined(session) || !this.isSessionActive(session)) {
      throw buildInvalidSessionException();
    }

    const refreshedCachedSession = this.toCachedSession(session);

    await this.touchSessionIfDue(tokenHash, refreshedCachedSession);
    await this.cacheStorageService.set(
      tokenHash,
      refreshedCachedSession,
      USER_SESSION_CACHE_TTL_MS,
    );

    return this.buildPayloadFromCachedSession(refreshedCachedSession);
  }

  async findSessionByToken(
    sessionToken: string,
  ): Promise<UserSessionEntity | null> {
    return this.userSessionRepository.findOneBy({
      tokenHash: hashUserSessionToken(sessionToken),
    });
  }

  async findActiveSessionsForUser(
    userId: string,
  ): Promise<UserSessionEntity[]> {
    const now = new Date();
    const idleTimeoutMs = ms(
      this.twentyConfigService.get('SESSION_IDLE_TIMEOUT'),
    );

    return this.userSessionRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
        lastActiveAt: MoreThan(addMilliseconds(now, -idleTimeoutMs)),
      },
      order: { lastActiveAt: 'DESC' },
    });
  }

  async revokeSessionByToken(
    sessionToken: string,
    reason: UserSessionRevokedReason,
  ): Promise<boolean> {
    const session = await this.findSessionByToken(sessionToken);

    if (!isDefined(session)) {
      return false;
    }

    return await this.revokeSessionEntity(session, reason);
  }

  async revokeSessionByIdForUser({
    sessionId,
    userId,
    reason,
  }: {
    sessionId: string;
    userId: string;
    reason: UserSessionRevokedReason;
  }): Promise<boolean> {
    const session = await this.userSessionRepository.findOneBy({
      id: sessionId,
      userId,
    });

    if (!isDefined(session)) {
      throw new AuthException(
        'Session not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return await this.revokeSessionEntity(session, reason);
  }

  async revokeAllSessionsForUser({
    userId,
    reason,
    exceptSessionId,
  }: {
    userId: string;
    reason: UserSessionRevokedReason;
    exceptSessionId?: string;
  }): Promise<number> {
    const sessions = await this.userSessionRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        ...(isDefined(exceptSessionId) ? { id: Not(exceptSessionId) } : {}),
      },
    });

    if (sessions.length === 0) {
      return 0;
    }

    await this.userSessionRepository.update(
      { id: In(sessions.map((session) => session.id)), revokedAt: IsNull() },
      { revokedAt: new Date(), revokedReason: reason },
    );

    await this.cacheStorageService.mdel(
      sessions.map((session) => session.tokenHash),
    );

    return sessions.length;
  }

  async signOut({
    sessionToken,
    refreshToken,
  }: {
    sessionToken?: string;
    refreshToken?: string;
  }): Promise<void> {
    if (isNonEmptyString(sessionToken)) {
      await this.revokeSessionByToken(
        sessionToken,
        UserSessionRevokedReason.UserSignOut,
      );
    }

    if (isNonEmptyString(refreshToken)) {
      await this.revokePresentedRefreshToken(refreshToken);
    }
  }

  private async revokePresentedRefreshToken(
    refreshToken: string,
  ): Promise<void> {
    try {
      await this.jwtWrapperService.verifyJwtToken(refreshToken);

      const payload = this.jwtWrapperService.decode<RefreshTokenJwtPayload>(
        refreshToken,
        { json: true },
      );

      if (
        payload?.type !== JwtTokenTypeEnum.REFRESH ||
        !isNonEmptyString(payload.jti)
      ) {
        return;
      }

      await this.appTokenRepository.update(
        {
          id: payload.jti,
          type: AppTokenType.RefreshToken,
          revokedAt: IsNull(),
        },
        { revokedAt: new Date() },
      );
    } catch {
      // Sign-out is forgiving: an invalid or expired refresh token is
      // already unusable, so there is nothing to revoke.
    }
  }

  private async revokeSessionEntity(
    session: UserSessionEntity,
    reason: UserSessionRevokedReason,
  ): Promise<boolean> {
    const { affected } = await this.userSessionRepository.update(
      { id: session.id, revokedAt: IsNull() },
      { revokedAt: new Date(), revokedReason: reason },
    );

    await this.cacheStorageService.del(session.tokenHash);

    const wasRevoked = affected === 1;

    if (wasRevoked) {
      this.emitAuthSessionEvent(
        session,
        reason === UserSessionRevokedReason.UserSignOut
          ? 'user_signed_out'
          : 'session_revoked',
      );
    }

    return wasRevoked;
  }

  private isSessionActive(session: UserSessionEntity): boolean {
    return (
      !isDefined(session.revokedAt) &&
      this.isCachedSessionActive(this.toCachedSession(session))
    );
  }

  private isCachedSessionActive(cachedSession: CachedUserSession): boolean {
    const now = Date.now();
    const idleTimeoutMs = ms(
      this.twentyConfigService.get('SESSION_IDLE_TIMEOUT'),
    );

    return (
      new Date(cachedSession.expiresAt).getTime() > now &&
      new Date(cachedSession.lastActiveAt).getTime() + idleTimeoutMs > now
    );
  }

  private async touchSessionIfDue(
    tokenHash: string,
    cachedSession: CachedUserSession,
  ): Promise<void> {
    const now = new Date();

    if (
      now.getTime() - new Date(cachedSession.lastActiveAt).getTime() <
      USER_SESSION_TOUCH_INTERVAL_MS
    ) {
      return;
    }

    try {
      await this.userSessionRepository.update(
        { id: cachedSession.sessionId, revokedAt: IsNull() },
        { lastActiveAt: now },
      );

      cachedSession.lastActiveAt = now.toISOString();

      await this.cacheStorageService.set(
        tokenHash,
        cachedSession,
        USER_SESSION_CACHE_TTL_MS,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to touch session ${cachedSession.sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private toCachedSession(session: UserSessionEntity): CachedUserSession {
    return {
      sessionId: session.id,
      userId: session.userId,
      workspaceId: session.workspaceId,
      userWorkspaceId: session.userWorkspaceId,
      authProvider: session.authProvider,
      isImpersonating: session.isImpersonating,
      impersonatorUserWorkspaceId: session.impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId: session.impersonatedUserWorkspaceId,
      expiresAt: session.expiresAt.toISOString(),
      lastActiveAt: session.lastActiveAt.toISOString(),
    };
  }

  private buildPayloadFromCachedSession(
    cachedSession: CachedUserSession,
  ): AccessTokenJwtPayload | WorkspaceAgnosticTokenJwtPayload {
    if (!isDefined(cachedSession.workspaceId)) {
      return {
        sub: cachedSession.userId,
        userId: cachedSession.userId,
        authProvider: cachedSession.authProvider,
        type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
      };
    }

    if (!isDefined(cachedSession.userWorkspaceId)) {
      throw buildInvalidSessionException();
    }

    return {
      sub: cachedSession.userId,
      userId: cachedSession.userId,
      workspaceId: cachedSession.workspaceId,
      userWorkspaceId: cachedSession.userWorkspaceId,
      authProvider: cachedSession.authProvider,
      type: JwtTokenTypeEnum.ACCESS,
      isImpersonating: cachedSession.isImpersonating === true,
      impersonatorUserWorkspaceId:
        cachedSession.isImpersonating === true
          ? (cachedSession.impersonatorUserWorkspaceId ?? undefined)
          : undefined,
      impersonatedUserWorkspaceId:
        cachedSession.isImpersonating === true
          ? (cachedSession.impersonatedUserWorkspaceId ?? undefined)
          : undefined,
    };
  }

  private emitAuthSessionEvent(
    session: UserSessionEntity,
    action: 'user_signed_in' | 'user_signed_out' | 'session_revoked',
  ): void {
    if (!isDefined(session.workspaceId)) {
      return;
    }

    const eventLogContext = this.eventLogEmitterService.createContext({
      workspaceId: session.workspaceId,
      userId: session.userId,
    });

    void eventLogContext.insertWorkspaceEvent(AUTH_SESSION_EVENT, {
      action,
      message: `sessionId=${session.id}; authProvider=${session.authProvider}`,
    });
  }
}
