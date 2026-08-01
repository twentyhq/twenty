import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import {
  UserSessionEntity,
  UserSessionRevokedReason,
} from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/user-session-token.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

describe('UserSessionService', () => {
  let service: UserSessionService;
  let userSessionRepository: Repository<UserSessionEntity>;
  let appTokenRepository: Repository<AppTokenEntity>;
  let jwtWrapperService: JwtWrapperService;

  const cacheStorageService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    mdel: jest.fn(),
  };

  const insertWorkspaceEvent = jest.fn();

  const mockConfig: Record<string, unknown> = {
    SESSION_ABSOLUTE_LIFETIME: '90d',
    SESSION_IDLE_TIMEOUT: '30d',
  };

  const buildActiveSession = (
    overrides: Partial<UserSessionEntity> = {},
  ): UserSessionEntity =>
    ({
      id: randomUUID(),
      tokenHash: 'token-hash',
      userId: randomUUID(),
      workspaceId: randomUUID(),
      userWorkspaceId: randomUUID(),
      authProvider: AuthProviderEnum.Password,
      isImpersonating: false,
      impersonatorUserWorkspaceId: null,
      impersonatedUserWorkspaceId: null,
      userAgent: null,
      ipAddress: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastActiveAt: new Date(),
      revokedAt: null,
      revokedReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as UserSessionEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSessionService,
        {
          provide: getRepositoryToken(UserSessionEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: CacheStorageNamespace.EngineAuthSession,
          useValue: cacheStorageService,
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        {
          provide: JwtWrapperService,
          useValue: {
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: jest.fn(() => ({ insertWorkspaceEvent })),
          },
        },
      ],
    }).compile();

    service = module.get<UserSessionService>(UserSessionService);
    userSessionRepository = module.get<Repository<UserSessionEntity>>(
      getRepositoryToken(UserSessionEntity),
    );
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
  });

  describe('createSession', () => {
    it('should create a workspace session and emit a sign-in event', async () => {
      const sessionInput = {
        userId: randomUUID(),
        workspaceId: randomUUID(),
        userWorkspaceId: randomUUID(),
        authProvider: AuthProviderEnum.Password,
        origin: 'sign_in' as const,
      };

      jest
        .spyOn(userSessionRepository, 'create')
        .mockImplementation((entity) => entity as UserSessionEntity);
      jest
        .spyOn(userSessionRepository, 'save')
        .mockImplementation(async (entity) =>
          buildActiveSession(entity as Partial<UserSessionEntity>),
        );

      const { sessionToken, session } =
        await service.createSession(sessionInput);

      expect(sessionToken).toMatch(/^sess_/);
      expect(session.tokenHash).toEqual(hashUserSessionToken(sessionToken));
      expect(session.userId).toEqual(sessionInput.userId);
      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        'AuthSession',
        expect.objectContaining({ action: 'user_signed_in' }),
      );
    });

    it('should not emit a sign-in event for renewal-bridge sessions', async () => {
      jest
        .spyOn(userSessionRepository, 'create')
        .mockImplementation((entity) => entity as UserSessionEntity);
      jest
        .spyOn(userSessionRepository, 'save')
        .mockImplementation(async (entity) =>
          buildActiveSession(entity as Partial<UserSessionEntity>),
        );

      await service.createSession({
        userId: randomUUID(),
        workspaceId: randomUUID(),
        userWorkspaceId: randomUUID(),
        authProvider: AuthProviderEnum.Password,
        origin: 'renewal_bridge',
      });

      expect(insertWorkspaceEvent).not.toHaveBeenCalled();
    });

    it('should cap impersonation sessions to a short lifetime', async () => {
      jest
        .spyOn(userSessionRepository, 'create')
        .mockImplementation((entity) => entity as UserSessionEntity);
      jest
        .spyOn(userSessionRepository, 'save')
        .mockImplementation(async (entity) => entity as UserSessionEntity);

      const { session } = await service.createSession({
        userId: randomUUID(),
        workspaceId: randomUUID(),
        userWorkspaceId: randomUUID(),
        authProvider: AuthProviderEnum.Impersonation,
        isImpersonating: true,
        impersonatorUserWorkspaceId: randomUUID(),
        impersonatedUserWorkspaceId: randomUUID(),
        origin: 'sign_in',
      });

      const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;

      expect(session.expiresAt.getTime()).toBeLessThanOrEqual(
        oneDayFromNow + 1000,
      );
    });

    it('should reject a workspace session without a user workspace', async () => {
      await expect(
        service.createSession({
          userId: randomUUID(),
          workspaceId: randomUUID(),
          authProvider: AuthProviderEnum.Password,
          origin: 'sign_in',
        }),
      ).rejects.toThrow(AuthException);
    });
  });

  const mockPostCachingRevocationCheck = (
    session: UserSessionEntity | null,
  ) => {
    jest.spyOn(userSessionRepository, 'findOne').mockResolvedValue(session);
  };

  describe('resolveSession', () => {
    it('should resolve an access payload from the database on cache miss', async () => {
      const session = buildActiveSession();

      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      mockPostCachingRevocationCheck(session);

      const { payload } = await service.resolveSession('sess_token');

      expect(payload).toEqual(
        expect.objectContaining({
          type: JwtTokenTypeEnum.ACCESS,
          userId: session.userId,
          workspaceId: session.workspaceId,
          userWorkspaceId: session.userWorkspaceId,
        }),
      );
      expect(cacheStorageService.set).toHaveBeenCalled();
    });

    it('should resolve a workspace-agnostic payload for sessions without workspace', async () => {
      const session = buildActiveSession({
        workspaceId: null,
        userWorkspaceId: null,
      });

      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      mockPostCachingRevocationCheck(session);

      const { payload } = await service.resolveSession('sess_token');

      expect(payload.type).toEqual(JwtTokenTypeEnum.WORKSPACE_AGNOSTIC);
    });

    it('should resolve from cache without hitting the database', async () => {
      const session = buildActiveSession();

      cacheStorageService.get.mockResolvedValue({
        sessionId: session.id,
        userId: session.userId,
        workspaceId: session.workspaceId,
        userWorkspaceId: session.userWorkspaceId,
        authProvider: session.authProvider,
        isImpersonating: false,
        impersonatorUserWorkspaceId: null,
        impersonatedUserWorkspaceId: null,
        expiresAt: session.expiresAt.toISOString(),
        lastActiveAt: new Date().toISOString(),
        authenticatedAt: session.createdAt.toISOString(),
      });
      const findOneBySpy = jest.spyOn(userSessionRepository, 'findOneBy');

      const { payload } = await service.resolveSession('sess_token');

      expect(payload.userId).toEqual(session.userId);
      expect(findOneBySpy).not.toHaveBeenCalled();
    });

    it('should reject a revoked session', async () => {
      cacheStorageService.get.mockResolvedValue(undefined);
      jest
        .spyOn(userSessionRepository, 'findOneBy')
        .mockResolvedValue(buildActiveSession({ revokedAt: new Date() }));

      await expect(service.resolveSession('sess_token')).rejects.toThrow(
        'Session is invalid or has expired.',
      );
    });

    it('should reject a session past its absolute expiry', async () => {
      cacheStorageService.get.mockResolvedValue(undefined);
      jest
        .spyOn(userSessionRepository, 'findOneBy')
        .mockResolvedValue(
          buildActiveSession({ expiresAt: new Date(Date.now() - 1000) }),
        );

      await expect(service.resolveSession('sess_token')).rejects.toThrow(
        'Session is invalid or has expired.',
      );
    });

    it('should reject an idle-expired session', async () => {
      const idleExpiredLastActiveAt = new Date(
        Date.now() - 31 * 24 * 60 * 60 * 1000,
      );

      cacheStorageService.get.mockResolvedValue(undefined);
      jest
        .spyOn(userSessionRepository, 'findOneBy')
        .mockResolvedValue(
          buildActiveSession({ lastActiveAt: idleExpiredLastActiveAt }),
        );

      await expect(service.resolveSession('sess_token')).rejects.toThrow(
        'Session is invalid or has expired.',
      );
    });

    it('should reject an unknown session token', async () => {
      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.resolveSession('sess_unknown')).rejects.toThrow(
        'Session is invalid or has expired.',
      );
    });

    it('should touch lastActiveAt when the touch interval elapsed', async () => {
      const staleLastActiveAt = new Date(Date.now() - 10 * 60 * 1000);
      const session = buildActiveSession({ lastActiveAt: staleLastActiveAt });

      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      mockPostCachingRevocationCheck(session);
      const updateSpy = jest
        .spyOn(userSessionRepository, 'update')
        .mockResolvedValue({ affected: 1 } as never);

      await service.resolveSession('sess_token');

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: session.id }),
        expect.objectContaining({ lastActiveAt: expect.any(Date) }),
      );
    });

    it('should not touch lastActiveAt on every request', async () => {
      const session = buildActiveSession({ lastActiveAt: new Date() });

      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      mockPostCachingRevocationCheck(session);
      const updateSpy = jest.spyOn(userSessionRepository, 'update');

      await service.resolveSession('sess_token');

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should reject and drop the cache entry when the touch hits a revoked session', async () => {
      const staleLastActiveAt = new Date(Date.now() - 10 * 60 * 1000);
      const session = buildActiveSession({ lastActiveAt: staleLastActiveAt });

      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      jest
        .spyOn(userSessionRepository, 'update')
        .mockResolvedValue({ affected: 0 } as never);

      await expect(service.resolveSession('sess_token')).rejects.toThrow(
        'Session is invalid or has expired.',
      );
      expect(cacheStorageService.del).toHaveBeenCalled();
    });

    it('should reject when a revocation raced the cache write', async () => {
      const session = buildActiveSession();

      cacheStorageService.get.mockResolvedValue(undefined);
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      mockPostCachingRevocationCheck(
        buildActiveSession({ id: session.id, revokedAt: new Date() }),
      );

      await expect(service.resolveSession('sess_token')).rejects.toThrow(
        'Session is invalid or has expired.',
      );
      expect(cacheStorageService.del).toHaveBeenCalled();
    });
  });

  describe('revokeSessionByToken', () => {
    it('should revoke the session, drop the cache entry and emit an event', async () => {
      const session = buildActiveSession();

      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(session);
      jest
        .spyOn(userSessionRepository, 'update')
        .mockResolvedValue({ affected: 1 } as never);

      const wasRevoked = await service.revokeSessionByToken(
        'sess_token',
        UserSessionRevokedReason.UserSignOut,
      );

      expect(wasRevoked).toBe(true);
      expect(cacheStorageService.del).toHaveBeenCalledWith(session.tokenHash);
      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        'AuthSession',
        expect.objectContaining({ action: 'user_signed_out' }),
      );
    });

    it('should be a no-op for an unknown token', async () => {
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(null);

      const wasRevoked = await service.revokeSessionByToken(
        'sess_unknown',
        UserSessionRevokedReason.UserSignOut,
      );

      expect(wasRevoked).toBe(false);
    });
  });

  describe('revokeSessionByIdForUser', () => {
    it('should refuse to revoke a session belonging to another user', async () => {
      jest.spyOn(userSessionRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.revokeSessionByIdForUser({
          sessionId: randomUUID(),
          userId: randomUUID(),
          reason: UserSessionRevokedReason.UserRevoked,
        }),
      ).rejects.toThrow('Session not found');
    });
  });

  describe('revokeAllSessionsForUser', () => {
    const mockRevokingQueryBuilder = (revokedSessions: UserSessionEntity[]) => {
      const queryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: revokedSessions.map(
            ({ id, tokenHash, userId, workspaceId }) => ({
              id,
              tokenHash,
              userId,
              workspaceId,
            }),
          ),
        }),
      };

      jest
        .spyOn(userSessionRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as never);

      return queryBuilder;
    };

    it('should revoke every active session except the excluded one', async () => {
      const userId = randomUUID();
      const exceptSessionId = randomUUID();
      const sessions = [
        buildActiveSession({ userId, tokenHash: 'hash-1' }),
        buildActiveSession({ userId, tokenHash: 'hash-2' }),
      ];

      const queryBuilder = mockRevokingQueryBuilder(sessions);

      const revokedCount = await service.revokeAllSessionsForUser({
        userId,
        exceptSessionId,
        reason: UserSessionRevokedReason.PasswordChanged,
      });

      expect(revokedCount).toBe(2);
      expect(queryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          revokedReason: UserSessionRevokedReason.PasswordChanged,
        }),
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(String), {
        userId,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(String), {
        exceptSessionId,
      });
      expect(cacheStorageService.mdel).toHaveBeenCalledWith([
        'hash-1',
        'hash-2',
      ]);
    });

    // The UPDATE carries the predicate itself, so a session created while it
    // runs is revoked too rather than slipping through a stale id list.
    it('should scope the update to the user rather than to pre-read ids', async () => {
      const userId = randomUUID();
      const queryBuilder = mockRevokingQueryBuilder([
        buildActiveSession({ userId, tokenHash: 'hash' }),
      ]);

      const findSpy = jest.spyOn(userSessionRepository, 'find');

      await service.revokeAllSessionsForUser({
        userId,
        reason: UserSessionRevokedReason.PasswordChanged,
      });

      expect(findSpy).not.toHaveBeenCalled();
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ exceptSessionId: expect.anything() }),
      );
    });

    it('should report nothing revoked when no session matched', async () => {
      mockRevokingQueryBuilder([]);

      const revokedCount = await service.revokeAllSessionsForUser({
        userId: randomUUID(),
        reason: UserSessionRevokedReason.PasswordChanged,
      });

      expect(revokedCount).toBe(0);
      expect(insertWorkspaceEvent).not.toHaveBeenCalled();
      expect(cacheStorageService.mdel).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should revoke the presented refresh token by jti', async () => {
      const refreshTokenId = randomUUID();

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue({
        type: JwtTokenTypeEnum.REFRESH,
        jti: refreshTokenId,
      });
      const updateSpy = jest
        .spyOn(appTokenRepository, 'update')
        .mockResolvedValue({ affected: 1 } as never);

      await service.signOut({ refreshToken: 'refresh-token' });

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: refreshTokenId }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('should swallow invalid refresh tokens', async () => {
      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockRejectedValue(new Error('expired'));
      const updateSpy = jest.spyOn(appTokenRepository, 'update');

      await expect(
        service.signOut({ refreshToken: 'expired-token' }),
      ).resolves.toBeUndefined();
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });
});
