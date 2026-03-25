import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

import { EmailVerificationTokenService } from './email-verification-token.service';

describe('EmailVerificationTokenService', () => {
  let service: EmailVerificationTokenService;
  let appTokenRepository: Repository<AppTokenEntity>;
  let userRepository: Repository<UserEntity>;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationTokenService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailVerificationTokenService>(
      EmailVerificationTokenService,
    );
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  describe('generateToken', () => {
    it('should generate a verification token successfully', async () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const mockExpiresIn = '24h';

      jest.spyOn(twentyConfigService, 'get').mockReturnValue(mockExpiresIn);
      jest
        .spyOn(appTokenRepository, 'create')
        .mockReturnValue({} as AppTokenEntity);
      jest
        .spyOn(appTokenRepository, 'save')
        .mockResolvedValue({} as AppTokenEntity);

      const result = await service.generateToken(userId, email);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresAt');
      expect(result.token).toHaveLength(64); // 32 bytes in hex = 64 characters
      expect(appTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type: AppTokenType.EmailVerificationToken,
          context: { email },
        }),
      );
      expect(appTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('validateEmailVerificationTokenOrThrow', () => {
    it('should validate token successfully and return user', async () => {
      const plainToken = 'plain-token';
      const hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockAppToken = {
        type: AppTokenType.EmailVerificationToken,
        expiresAt: new Date(Date.now() + 86400000), // 24h from now
        context: { email: 'test@example.com' },
        user: mockUser,
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppTokenEntity);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.validateEmailVerificationTokenOrThrow({
        emailVerificationToken: plainToken,
        email: 'test@example.com',
      });

      expect(result).toEqual(mockAppToken);
      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          value: hashedToken,
          type: AppTokenType.EmailVerificationToken,
        },
        relations: ['user'],
      });
    });

    it('should throw exception for invalid token', async () => {
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateEmailVerificationTokenOrThrow({
          emailVerificationToken: 'invalid-token',
          email: 'test@twenty.com',
        }),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Invalid email verification token',
          EmailVerificationExceptionCode.INVALID_TOKEN,
        ),
      );
    });

    it('should throw exception for already validated token', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: true,
      };

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);

      await expect(
        service.validateEmailVerificationTokenOrThrow({
          emailVerificationToken: 'invalid-token',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Email already verified',
          EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED,
        ),
      );
    });

    it('should throw exception when email does not match appToken email', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      };

      const mockAppToken = {
        type: AppTokenType.EmailVerificationToken,
        expiresAt: new Date(Date.now() + 86400000), // 24h from now
        context: { email: 'other-email@example.com' },
        user: {
          email: 'other-email@example.com',
        },
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppTokenEntity);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateEmailVerificationTokenOrThrow({
          emailVerificationToken: 'valid-token',
          email: mockUser.email,
        }),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Email does not match token',
          EmailVerificationExceptionCode.INVALID_EMAIL,
        ),
      );
    });

    it('should throw exception for wrong token type', async () => {
      const mockAppToken = {
        type: AppTokenType.PasswordResetToken,
        expiresAt: new Date(Date.now() + 86400000),
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppTokenEntity);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateEmailVerificationTokenOrThrow({
          emailVerificationToken: 'wrong-type-token',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Invalid email verification token type',
          EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE,
        ),
      );
    });

    it('should throw exception for expired token', async () => {
      const mockAppToken = {
        type: AppTokenType.EmailVerificationToken,
        expiresAt: new Date(Date.now() - 86400000), // 24h ago
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppTokenEntity);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateEmailVerificationTokenOrThrow({
          emailVerificationToken: 'expired-token',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Email verification token expired',
          EmailVerificationExceptionCode.TOKEN_EXPIRED,
        ),
      );
    });

    it('should throw exception when email is missing in context', async () => {
      const mockAppToken = {
        type: AppTokenType.EmailVerificationToken,
        expiresAt: new Date(Date.now() + 86400000),
        context: {},
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppTokenEntity);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateEmailVerificationTokenOrThrow({
          emailVerificationToken: 'valid-token',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Email missing in email verification token context',
          EmailVerificationExceptionCode.EMAIL_MISSING,
        ),
      );
    });
  });
});
