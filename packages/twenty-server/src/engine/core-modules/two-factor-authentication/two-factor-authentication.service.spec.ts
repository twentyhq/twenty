import { Test, type TestingModule } from '@nestjs/testing';

import { authenticator } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { TWO_FACTOR_AUTHENTICATION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/two-factor-authentication/two-factor-authentication';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';

import { TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';
import { OTPStatus } from './strategies/otp/otp.constants';

const TOTP_STEP_DURATION_MS = 30_000;

const USER_ID = 'user-123';
const WORKSPACE_ID = 'workspace-123';
const METHOD_ID = '2fa-method-123';

describe('TwoFactorAuthenticationService', () => {
  let service: TwoFactorAuthenticationService;
  let repository: {
    findOne: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let throttlerService: { atomicTokenBucketThrottleOrThrow: jest.Mock };
  let insertWorkspaceEvent: jest.Mock;
  let secret: string;

  const buildVerifiedMethod = (
    overrides: Partial<TwoFactorAuthenticationMethodEntity> = {},
  ): TwoFactorAuthenticationMethodEntity =>
    ({
      id: METHOD_ID,
      secret: 'enc:v2:encrypted-secret',
      status: OTPStatus.VERIFIED,
      strategy: TwoFactorAuthenticationStrategy.TOTP,
      userWorkspace: { userId: USER_ID, workspaceId: WORKSPACE_ID },
      ...overrides,
    }) as TwoFactorAuthenticationMethodEntity;

  beforeEach(async () => {
    secret = authenticator.generateSecret();
    insertWorkspaceEvent = jest.fn().mockResolvedValue({ success: true });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationService,
        {
          provide: getWorkspaceScopedRepositoryToken(
            TwoFactorAuthenticationMethodEntity,
          ),
          useValue: {
            findOne: jest.fn(),
            upsert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: { getUserWorkspaceForUserOrThrow: jest.fn() },
        },
        {
          provide: SecretEncryptionService,
          useValue: {
            encryptVersioned: jest.fn(),
            decryptVersionedOrThrow: jest.fn().mockImplementation(() => secret),
          },
        },
        {
          provide: ThrottlerService,
          useValue: { atomicTokenBucketThrottleOrThrow: jest.fn() },
        },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: jest.fn().mockReturnValue({ insertWorkspaceEvent }),
          },
        },
      ],
    }).compile();

    service = module.get(TwoFactorAuthenticationService);
    repository = module.get(
      getWorkspaceScopedRepositoryToken(TwoFactorAuthenticationMethodEntity),
    );
    throttlerService = module.get(ThrottlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateStrategy', () => {
    it('consumes a rate-limit token per attempt keyed by user and workspace', async () => {
      repository.findOne.mockResolvedValue(buildVerifiedMethod());

      await service.validateStrategy(
        USER_ID,
        authenticator.generate(secret),
        WORKSPACE_ID,
        TwoFactorAuthenticationStrategy.TOTP,
      );

      expect(
        throttlerService.atomicTokenBucketThrottleOrThrow,
      ).toHaveBeenCalledWith({
        key: `two-factor-authentication-otp:${USER_ID}:${WORKSPACE_ID}`,
        maxTokens: expect.any(Number),
        timeWindow: expect.any(Number),
      });
    });

    it('rejects the attempt without touching the method when the limit is reached', async () => {
      throttlerService.atomicTokenBucketThrottleOrThrow.mockRejectedValue(
        new ThrottlerException(
          'Limit reached',
          ThrottlerExceptionCode.LIMIT_REACHED,
        ),
      );

      await expect(
        service.validateStrategy(
          USER_ID,
          authenticator.generate(secret),
          WORKSPACE_ID,
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(ThrottlerException);

      expect(repository.findOne).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('records a rejected attempt when no method is configured', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.validateStrategy(
          USER_ID,
          '123456',
          WORKSPACE_ID,
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(
        new TwoFactorAuthenticationException(
          'Two Factor Authentication Method not found.',
          TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
        ),
      );

      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        TWO_FACTOR_AUTHENTICATION_EVENT,
        {
          action: 'otp_rejected',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
          targetUserId: USER_ID,
          message: 'No two-factor authentication method configured',
        },
      );
    });

    it('records a rejected code and throws INVALID_OTP', async () => {
      repository.findOne.mockResolvedValue(buildVerifiedMethod());

      const staleToken = authenticator
        .clone({ epoch: Date.now() - 10 * TOTP_STEP_DURATION_MS })
        .generate(secret);

      await expect(
        service.validateStrategy(
          USER_ID,
          staleToken,
          WORKSPACE_ID,
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(
        new TwoFactorAuthenticationException(
          'Invalid OTP',
          TwoFactorAuthenticationExceptionCode.INVALID_OTP,
        ),
      );

      expect(repository.update).not.toHaveBeenCalled();
      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        TWO_FACTOR_AUTHENTICATION_EVENT,
        {
          action: 'otp_rejected',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
          targetUserId: USER_ID,
        },
      );
    });

    it('records enrollment completion when a pending method is verified', async () => {
      repository.findOne.mockResolvedValue(
        buildVerifiedMethod({ status: OTPStatus.PENDING }),
      );

      await service.validateStrategy(
        USER_ID,
        authenticator.generate(secret),
        WORKSPACE_ID,
        TwoFactorAuthenticationStrategy.TOTP,
      );

      expect(repository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: METHOD_ID },
        { status: OTPStatus.VERIFIED },
      );
      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        TWO_FACTOR_AUTHENTICATION_EVENT,
        {
          action: 'method_verified',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
          targetUserId: USER_ID,
        },
      );
    });

    it('does not record enrollment again for an already verified method', async () => {
      repository.findOne.mockResolvedValue(buildVerifiedMethod());

      await service.validateStrategy(
        USER_ID,
        authenticator.generate(secret),
        WORKSPACE_ID,
        TwoFactorAuthenticationStrategy.TOTP,
      );

      expect(insertWorkspaceEvent).not.toHaveBeenCalled();
    });
  });

  describe('deleteTwoFactorAuthenticationMethodForAuthenticatedUser', () => {
    it('deletes the caller-owned method and records the deletion', async () => {
      repository.findOne.mockResolvedValue(buildVerifiedMethod());
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result =
        await service.deleteTwoFactorAuthenticationMethodForAuthenticatedUser({
          userId: USER_ID,
          workspaceId: WORKSPACE_ID,
          twoFactorAuthenticationMethodId: METHOD_ID,
        });

      expect(result).toEqual({ success: true });
      expect(repository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: { id: METHOD_ID },
        relations: ['userWorkspace'],
      });
      expect(repository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
        id: METHOD_ID,
      });
      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        TWO_FACTOR_AUTHENTICATION_EVENT,
        {
          action: 'method_deleted',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
          targetUserId: USER_ID,
        },
      );
    });

    it('does not record a deletion when a concurrent request already removed the method', async () => {
      repository.findOne.mockResolvedValue(buildVerifiedMethod());
      repository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result =
        await service.deleteTwoFactorAuthenticationMethodForAuthenticatedUser({
          userId: USER_ID,
          workspaceId: WORKSPACE_ID,
          twoFactorAuthenticationMethodId: METHOD_ID,
        });

      expect(result).toEqual({ success: true });
      expect(insertWorkspaceEvent).not.toHaveBeenCalled();
    });

    it('throws INVALID_INPUT when the method does not exist in the workspace', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteTwoFactorAuthenticationMethodForAuthenticatedUser({
          userId: USER_ID,
          workspaceId: WORKSPACE_ID,
          twoFactorAuthenticationMethodId: METHOD_ID,
        }),
      ).rejects.toThrow(
        new AuthException(
          'Two-factor authentication method not found',
          AuthExceptionCode.INVALID_INPUT,
        ),
      );

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN_EXCEPTION when the method belongs to another user', async () => {
      repository.findOne.mockResolvedValue(
        buildVerifiedMethod({
          userWorkspace: {
            userId: 'another-user',
            workspaceId: WORKSPACE_ID,
          },
        } as Partial<TwoFactorAuthenticationMethodEntity>),
      );

      await expect(
        service.deleteTwoFactorAuthenticationMethodForAuthenticatedUser({
          userId: USER_ID,
          workspaceId: WORKSPACE_ID,
          twoFactorAuthenticationMethodId: METHOD_ID,
        }),
      ).rejects.toThrow(
        new AuthException(
          'You can only delete your own two-factor authentication methods',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );

      expect(repository.delete).not.toHaveBeenCalled();
      expect(insertWorkspaceEvent).not.toHaveBeenCalled();
    });
  });
});
