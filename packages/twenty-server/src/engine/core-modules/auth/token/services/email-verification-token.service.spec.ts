import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { EmailVerificationTokenService } from './email-verification-token.service';

describe('EmailVerificationTokenService', () => {
  let service: EmailVerificationTokenService;
  let appTokenRepository: Repository<AppToken>;
  let environmentService: EnvironmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationTokenService,
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useClass: Repository,
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailVerificationTokenService>(
      EmailVerificationTokenService,
    );
    appTokenRepository = module.get<Repository<AppToken>>(
      getRepositoryToken(AppToken, 'core'),
    );
    environmentService = module.get<EnvironmentService>(EnvironmentService);
  });

  describe('generateToken', () => {
    it('should generate a verification token successfully', async () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const mockExpiresIn = '24h';

      jest.spyOn(environmentService, 'get').mockReturnValue(mockExpiresIn);
      jest.spyOn(appTokenRepository, 'create').mockReturnValue({} as AppToken);
      jest.spyOn(appTokenRepository, 'save').mockResolvedValue({} as AppToken);

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
        .mockResolvedValue(mockAppToken as AppToken);
      jest
        .spyOn(appTokenRepository, 'remove')
        .mockResolvedValue(mockAppToken as AppToken);

      const result =
        await service.validateEmailVerificationTokenOrThrow(plainToken);

      expect(result).toEqual(mockUser);
      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          value: hashedToken,
          type: AppTokenType.EmailVerificationToken,
        },
        relations: ['user'],
      });
      expect(appTokenRepository.remove).toHaveBeenCalledWith(mockAppToken);
    });

    it('should throw exception for invalid token', async () => {
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateEmailVerificationTokenOrThrow('invalid-token'),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Invalid email verification token',
          EmailVerificationExceptionCode.INVALID_TOKEN,
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
        .mockResolvedValue(mockAppToken as AppToken);

      await expect(
        service.validateEmailVerificationTokenOrThrow('wrong-type-token'),
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
        .mockResolvedValue(mockAppToken as AppToken);

      await expect(
        service.validateEmailVerificationTokenOrThrow('expired-token'),
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
        .mockResolvedValue(mockAppToken as AppToken);

      await expect(
        service.validateEmailVerificationTokenOrThrow('valid-token'),
      ).rejects.toThrow(
        new EmailVerificationException(
          'Email missing in email verification token context',
          EmailVerificationExceptionCode.EMAIL_MISSING,
        ),
      );
    });
  });
});
