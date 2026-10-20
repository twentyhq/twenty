import { type Repository } from 'typeorm';

import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { type UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

describe('UserSessionService', () => {
  let service: UserSessionService;
  let userSessionRepository: jest.Mocked<Repository<UserSessionEntity>>;

  beforeEach(() => {
    userSessionRepository = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserSessionEntity>>;

    service = new UserSessionService(
      userSessionRepository,
      {} as unknown as Repository<AppTokenEntity>,
      {} as unknown as CacheStorageService,
      {} as unknown as TwentyConfigService,
      {} as unknown as JwtWrapperService,
      {} as unknown as EventLogEmitterService,
      {} as unknown as UserSessionCookieService,
    );
  });

  describe('isSessionTokenSuperseded', () => {
    it('should look the session up by the hash of the presented token', async () => {
      userSessionRepository.findOneBy.mockResolvedValue(null);

      await service.isSessionTokenSuperseded('sess_token');

      expect(userSessionRepository.findOneBy).toHaveBeenCalledWith({
        tokenHash: hashUserSessionToken('sess_token'),
      });
    });

    it('should return false for an unknown token', async () => {
      userSessionRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.isSessionTokenSuperseded('sess_token'),
      ).resolves.toBe(false);
    });

    it('should return false for an active session', async () => {
      userSessionRepository.findOneBy.mockResolvedValue({
        revokedAt: null,
        revokedReason: null,
      } as unknown as UserSessionEntity);

      await expect(
        service.isSessionTokenSuperseded('sess_token'),
      ).resolves.toBe(false);
    });

    it('should return true for a session revoked as superseded', async () => {
      userSessionRepository.findOneBy.mockResolvedValue({
        revokedAt: new Date(),
        revokedReason: UserSessionRevokedReason.Superseded,
      } as unknown as UserSessionEntity);

      await expect(
        service.isSessionTokenSuperseded('sess_token'),
      ).resolves.toBe(true);
    });

    it.each(
      Object.values(UserSessionRevokedReason).filter(
        (reason) => reason !== UserSessionRevokedReason.Superseded,
      ),
    )(
      'should return false for a session revoked as %s',
      async (revokedReason) => {
        userSessionRepository.findOneBy.mockResolvedValue({
          revokedAt: new Date(),
          revokedReason,
        } as unknown as UserSessionEntity);

        await expect(
          service.isSessionTokenSuperseded('sess_token'),
        ).resolves.toBe(false);
      },
    );
  });
});
