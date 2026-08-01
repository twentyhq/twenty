import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { addMilliseconds } from 'date-fns';
import { type Request } from 'express';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthTokenPair } from 'src/engine/core-modules/auth/dto/auth-token-pair.dto';
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
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import {
  type CachedUserSession,
  type CreateUserSessionInput,
  type UserSessionCreationOrigin,
} from 'src/engine/core-modules/user-session/types/user-session.type';
import {
  generateUserSessionToken,
  hashUserSessionToken,
} from 'src/engine/core-modules/user-session/utils/user-session-token.util';

const USER_SESSION_CACHE_TTL_MS = 60 * 1000;
const USER_SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

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
    private readonly userSessionCookieService: UserSessionCookieService,
  ) {}

  // Bridge for the dual-stack migration: mints a session alongside the JWT
  // pair every exchange point returns, and sets the cookie on the response.
  // Best effort by design: a session failure must never break an otherwise
  // successful sign-in while token pairs remain the primary credential.
  async issueSessionForTokenPair({
    tokenPair,
    request,
    origin,
  }: {
    tokenPair: AuthTokenPair;
    request: Request;
    origin: UserSessionCreationOrigin;
  }): Promise<void> {
    if (!this.twentyConfigService.get('AUTH_COOKIE_SESSIONS_ENABLED')) {
      return;
    }

    const response = request.res;

    if (!isDefined(response)) {
      return;
    }

    try {
      const sessionInput = this.buildCreateSessionInputFromTokenPair(
        tokenPair,
        request,
        origin,
      );

      if (!isDefined(sessionInput)) {
        return;
      }

      const presentedSessionToken =
        this.userSessionCookieService.extractSessionTokenFromRequest(request);

      if (isDefined(presentedSessionToken)) {
        if (origin === 'renewal_bridge') {
          try {
            const { payload: presentedPayload } = await this.resolveSession(
              presentedSessionToken,
            );

            // The client already holds a valid session for the same scope:
            // renewals must not mint a new row every 30 minutes. Anything
            // scoped differently is replaced, never kept, so the cookie can
            // never resolve to a workspace the renewed pair does not carry.
            if (
              this.isSessionScopeMatchingRenewal(presentedPayload, sessionInput)
            ) {
              return;
            }

            await this.revokeSessionByToken(
              presentedSessionToken,
              UserSessionRevokedReason.Superseded,
            );
          } catch (error) {
            // Only an unusable session falls through to minting a fresh one.
            // A cache or database failure must not mint a row per renewal.
            if (
              !(error instanceof AuthException) ||
              error.code !== AuthExceptionCode.UNAUTHENTICATED
            ) {
              throw error;
            }
          }
        } else {
          // A real sign-in replaces whatever session the browser presented,
          // both against fixation and because the device changes hands.
          await this.revokeSessionByToken(
            presentedSessionToken,
            UserSessionRevokedReason.Superseded,
          );
        }
      }

      const { sessionToken, session } = await this.createSession(sessionInput);

      this.userSessionCookieService.attachSessionTokenToResponse(
        response,
        sessionToken,
        session.expiresAt,
      );
    } catch (error) {
      // Sign-in only: the presented cookie may be the previous account's and
      // still valid, so it must not survive a sign-in that failed to replace
      // it. On renewal the presented session is this user's own live one, and
      // a transient failure must not destroy it. Guarded either way, since
      // issuance stays best effort.
      if (origin === 'sign_in') {
        try {
          this.userSessionCookieService.clearSessionCookie(response);
        } catch {
          // Nothing further to do: the error below is what gets reported.
        }
      }

      this.logger.error(
        `Failed to issue a session alongside the token pair: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private isSessionScopeMatchingRenewal(
    presentedPayload: AccessTokenJwtPayload | WorkspaceAgnosticTokenJwtPayload,
    sessionInput: CreateUserSessionInput,
  ): boolean {
    if (presentedPayload.type !== JwtTokenTypeEnum.ACCESS) {
      return (
        presentedPayload.userId === sessionInput.userId &&
        !isDefined(sessionInput.workspaceId) &&
        sessionInput.isImpersonating !== true
      );
    }

    return (
      presentedPayload.userId === sessionInput.userId &&
      (presentedPayload.workspaceId ?? null) ===
        (sessionInput.workspaceId ?? null) &&
      (presentedPayload.isImpersonating === true) ===
        (sessionInput.isImpersonating === true) &&
      (presentedPayload.userWorkspaceId ?? null) ===
        (sessionInput.userWorkspaceId ?? null) &&
      (presentedPayload.impersonatorUserWorkspaceId ?? null) ===
        (sessionInput.impersonatorUserWorkspaceId ?? null) &&
      (presentedPayload.impersonatedUserWorkspaceId ?? null) ===
        (sessionInput.impersonatedUserWorkspaceId ?? null)
    );
  }

  private buildCreateSessionInputFromTokenPair(
    tokenPair: AuthTokenPair,
    request: Request,
    origin: UserSessionCreationOrigin,
  ): CreateUserSessionInput | undefined {
    const payload = this.jwtWrapperService.decode<
      AccessTokenJwtPayload | WorkspaceAgnosticTokenJwtPayload
    >(tokenPair.accessOrWorkspaceAgnosticToken.token, { json: true });

    if (!isDefined(payload)) {
      return undefined;
    }

    const requestMetadata = {
      userAgent: request.headers['user-agent'] ?? null,
      ipAddress: request.ip ?? null,
    };

    if (payload.type === JwtTokenTypeEnum.ACCESS) {
      return {
        userId: payload.userId ?? payload.sub,
        workspaceId: payload.workspaceId,
        userWorkspaceId: payload.userWorkspaceId,
        authProvider: payload.authProvider,
        isImpersonating: payload.isImpersonating === true,
        impersonatorUserWorkspaceId: payload.impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: payload.impersonatedUserWorkspaceId,
        origin,
        ...requestMetadata,
      };
    }

    if (payload.type === JwtTokenTypeEnum.WORKSPACE_AGNOSTIC) {
      return {
        userId: payload.userId ?? payload.sub,
        authProvider: payload.authProvider,
        origin,
        ...requestMetadata,
      };
    }

    return undefined;
  }

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

    if (!isDefined(input.workspaceId) && isDefined(input.userWorkspaceId)) {
      throw new AuthException(
        'Cannot create a workspace-agnostic session for a user workspace',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    // A half-filled impersonation session persists fine but is rejected on
    // every request it authenticates, so refuse it at creation instead.
    if (
      input.isImpersonating === true &&
      (!isDefined(input.workspaceId) ||
        !isDefined(input.impersonatorUserWorkspaceId) ||
        !isDefined(input.impersonatedUserWorkspaceId))
    ) {
      throw new AuthException(
        'Cannot create an impersonation session without a workspace and both user workspaces',
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
  async resolveSession(sessionToken: string): Promise<{
    payload: AccessTokenJwtPayload | WorkspaceAgnosticTokenJwtPayload;
    authenticatedAt: Date;
  }> {
    const tokenHash = hashUserSessionToken(sessionToken);

    const cachedSession =
      await this.cacheStorageService.get<CachedUserSession>(tokenHash);

    if (isDefined(cachedSession)) {
      if (!this.isCachedSessionActive(cachedSession)) {
        await this.cacheStorageService.del(tokenHash);

        throw buildInvalidSessionException();
      }

      await this.touchSessionIfDue(tokenHash, cachedSession);

      return this.toResolvedSession(cachedSession);
    }

    const session = await this.userSessionRepository.findOneBy({ tokenHash });

    if (!isDefined(session) || !this.isSessionActive(session)) {
      throw buildInvalidSessionException();
    }

    const refreshedCachedSession = this.toCachedSession(session);

    // A touch caches the same object and re-checks revocation itself, so
    // repeating both here would cost an extra Redis write and an extra
    // SELECT on the per-request auth path.
    const wasCachedByTouch = await this.touchSessionIfDue(
      tokenHash,
      refreshedCachedSession,
    );

    if (!wasCachedByTouch) {
      await this.cacheStorageService.set(
        tokenHash,
        refreshedCachedSession,
        USER_SESSION_CACHE_TTL_MS,
      );
      await this.assertNotRevokedAfterCaching(session.id, tokenHash);
    }

    return this.toResolvedSession(refreshedCachedSession);
  }

  private toResolvedSession(cachedSession: CachedUserSession): {
    payload: AccessTokenJwtPayload | WorkspaceAgnosticTokenJwtPayload;
    authenticatedAt: Date;
  } {
    return {
      payload: this.buildPayloadFromCachedSession(cachedSession),
      authenticatedAt: new Date(cachedSession.authenticatedAt),
    };
  }

  // A revocation racing the cache write above may have had its cache delete
  // land before our set, silently resurrecting the revoked session for a
  // full cache TTL. Re-checking after the write closes the race: any
  // revocation committing later deletes the entry we just wrote.
  private async assertNotRevokedAfterCaching(
    sessionId: string,
    tokenHash: string,
  ): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId },
      select: { id: true, revokedAt: true },
    });

    if (!isDefined(session) || isDefined(session.revokedAt)) {
      await this.cacheStorageService.del(tokenHash);

      throw buildInvalidSessionException();
    }
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

    // RETURNING names the rows this statement actually changed, so a session
    // revoked concurrently between the select and the update is neither
    // counted nor audited as revoked by this call.
    const { raw } = await this.userSessionRepository
      .createQueryBuilder()
      .update(UserSessionEntity)
      .set({ revokedAt: new Date(), revokedReason: reason })
      .where('"id" IN (:...sessionIds)', {
        sessionIds: sessions.map((session) => session.id),
      })
      .andWhere('"revokedAt" IS NULL')
      .returning(['id'])
      .execute();

    const revokedSessionIds = new Set(
      (raw as { id: string }[]).map((row) => row.id),
    );

    for (const session of sessions) {
      if (revokedSessionIds.has(session.id)) {
        this.emitAuthSessionEvent(session, 'session_revoked');
      }
    }

    // Every selected session is dropped from cache regardless: one revoked
    // concurrently is dead too, and evicting it again is harmless.
    await this.cacheStorageService.mdel(
      sessions.map((session) => session.tokenHash),
    );

    return revokedSessionIds.size;
  }

  async signOut({
    sessionToken,
    refreshToken,
  }: {
    sessionToken?: string;
    refreshToken?: string;
  }): Promise<void> {
    try {
      if (isNonEmptyString(sessionToken)) {
        await this.revokeSessionByToken(
          sessionToken,
          UserSessionRevokedReason.UserSignOut,
        );
      }
    } finally {
      if (isNonEmptyString(refreshToken)) {
        await this.revokePresentedRefreshToken(refreshToken);
      }
    }
  }

  private async revokePresentedRefreshToken(
    refreshToken: string,
  ): Promise<void> {
    let payload: RefreshTokenJwtPayload | undefined;

    try {
      await this.jwtWrapperService.verifyJwtToken(refreshToken);

      payload = this.jwtWrapperService.decode<RefreshTokenJwtPayload>(
        refreshToken,
        { json: true },
      );
    } catch {
      // Sign-out is forgiving: an invalid or expired refresh token is
      // already unusable, so there is nothing to revoke.
      return;
    }

    if (
      payload?.type !== JwtTokenTypeEnum.REFRESH ||
      !isNonEmptyString(payload.jti)
    ) {
      return;
    }

    // Deliberately outside the catch: a storage failure here leaves a usable
    // refresh token behind, so it must surface rather than report success.
    await this.appTokenRepository.update(
      {
        id: payload.jti,
        type: AppTokenType.RefreshToken,
        revokedAt: IsNull(),
      },
      { revokedAt: new Date() },
    );
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

  // Returns whether it wrote the session to cache and re-checked revocation.
  private async touchSessionIfDue(
    tokenHash: string,
    cachedSession: CachedUserSession,
  ): Promise<boolean> {
    const now = new Date();

    if (
      now.getTime() - new Date(cachedSession.lastActiveAt).getTime() <
      USER_SESSION_TOUCH_INTERVAL_MS
    ) {
      return false;
    }

    let affected: number | null | undefined;

    try {
      ({ affected } = await this.userSessionRepository.update(
        { id: cachedSession.sessionId, revokedAt: IsNull() },
        { lastActiveAt: now },
      ));
    } catch (error) {
      this.logger.warn(
        `Failed to touch session ${cachedSession.sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return false;
    }

    // Zero rows means the session was revoked or deleted since it was
    // cached: drop the entry instead of extending a dead session.
    if (affected === 0) {
      await this.cacheStorageService.del(tokenHash);

      throw buildInvalidSessionException();
    }

    cachedSession.lastActiveAt = now.toISOString();

    await this.cacheStorageService.set(
      tokenHash,
      cachedSession,
      USER_SESSION_CACHE_TTL_MS,
    );
    await this.assertNotRevokedAfterCaching(cachedSession.sessionId, tokenHash);

    return true;
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
      authenticatedAt: session.createdAt.toISOString(),
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
