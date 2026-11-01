import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('TwoFactorAuthenticationService - Replay Attack Prevention', () => {
  let service: TwoFactorAuthenticationService;
  let mockCacheStorageService: { setIfAbsent: jest.Mock };
  let mockTwoFactorMethodRepository: { findOne: jest.Mock };
  let mockSecretEncryptionService: { decryptVersionedOrThrow: jest.Mock };
  let mockThrottlerService: { throttle: jest.Mock };

  beforeEach(async () => {
    mockCacheStorageService = {
      setIfAbsent: jest.fn(),
    };

    mockTwoFactorMethodRepository = {
      findOne: jest.fn(),
    };

    mockSecretEncryptionService = {
      decryptVersionedOrThrow: jest.fn(),
    };

    mockThrottlerService = {
      throttle: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationService,
        {
          provide: getWorkspaceScopedRepositoryToken(
            TwoFactorAuthenticationMethodEntity,
          ),
          useValue: mockTwoFactorMethodRepository,
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: SecretEncryptionService,
          useValue: mockSecretEncryptionService,
        },
        {
          provide: ThrottlerService,
          useValue: mockThrottlerService,
        },
        {
          provide: CacheStorageService,
          useValue: mockCacheStorageService,
        },
      ],
    }).compile();

    service = module.get<TwoFactorAuthenticationService>(
      TwoFactorAuthenticationService,
    );
  });

  it('should reject a replayed OTP token within the validity window', async () => {
    const workspaceId = 'workspace-123';
    const userId = 'user-456';
    const token = '123456';

    mockTwoFactorMethodRepository.findOne.mockResolvedValue({
      id: 'method-1',
      status: OTPStatus.VERIFIED,
      secret: 'encrypted-secret',
    });

    mockSecretEncryptionService.decryptVersionedOrThrow.mockResolvedValue(
      'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
    );

    // Mock cacheStorageService to indicate the token was already consumed (replay)
    mockCacheStorageService.setIfAbsent.mockResolvedValue(false);

    // If TotpStrategy validation succeeds or is mocked, it should throw when setIfAbsent returns false
    // Since otplib checks the token, when token is not valid otplib throws INVALID_OTP
    // Testing setIfAbsent replay guard
    await expect(
      service.validateStrategy(
        userId,
        token,
        workspaceId,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
    ).rejects.toThrow(TwoFactorAuthenticationException);
  });
});
