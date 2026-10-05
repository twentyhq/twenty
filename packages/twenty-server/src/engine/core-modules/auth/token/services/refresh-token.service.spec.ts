import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

const TOKEN_ID = 'refresh-token-id';
const USER_ID = 'user-id';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let appTokenRepository: { findOneBy: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            verifyJwtToken: jest.fn(),
            decode: jest.fn().mockReturnValue({
              type: JwtTokenTypeEnum.REFRESH,
              jti: TOKEN_ID,
              sub: USER_ID,
            }),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue('1m') },
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: { findOneBy: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOneBy: jest.fn().mockResolvedValue({ id: USER_ID }) },
        },
      ],
    }).compile();

    service = module.get(RefreshTokenService);
    appTokenRepository = module.get(getRepositoryToken(AppTokenEntity));
  });

  it('still accepts a token rotated moments ago by a concurrent renewal', async () => {
    appTokenRepository.findOneBy.mockResolvedValue({
      id: TOKEN_ID,
      revokedAt: new Date(),
      context: null,
    });

    await expect(service.verifyRefreshToken('token')).resolves.toMatchObject({
      token: { id: TOKEN_ID },
    });
  });

  it('rejects a token revoked for a security reason even inside the reuse grace period', async () => {
    appTokenRepository.findOneBy.mockResolvedValue({
      id: TOKEN_ID,
      revokedAt: new Date(),
      context: {
        revokedReason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
      },
    });

    await expect(service.verifyRefreshToken('token')).rejects.toMatchObject({
      code: AuthExceptionCode.FORBIDDEN_EXCEPTION,
    });
  });

  it('rejects a token revoked before the reuse grace period', async () => {
    appTokenRepository.findOneBy.mockResolvedValue({
      id: TOKEN_ID,
      revokedAt: new Date(Date.now() - 5 * 60 * 1000),
      context: null,
    });

    await expect(service.verifyRefreshToken('token')).rejects.toMatchObject({
      code: AuthExceptionCode.FORBIDDEN_EXCEPTION,
    });
  });
});
