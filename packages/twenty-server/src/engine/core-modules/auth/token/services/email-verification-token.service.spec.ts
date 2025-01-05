import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

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
import { UserService } from 'src/engine/core-modules/user/services/user.service';

import { EmailVerificationTokenService } from './email-verification-token.service';

describe('EmailVerificationTokenService', () => {
  let service: EmailVerificationTokenService;
  let appTokenRepository: Repository<AppToken>;
  let environmentService: EnvironmentService;
  let userService: UserService;

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
        {
          provide: UserService,
          useValue: {
            markEmailAsVerified: jest.fn(),
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
    userService = module.get<UserService>(UserService);
  });

  describe('generateToken', () => {
    it('should generate a verification token successfully', async () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const mockExpiresIn = '24h';
      const mockToken = {
        id: 'token-id',
        value: 'test-token-value',
      };

      jest.spyOn(environmentService, 'get').mockReturnValue(mockExpiresIn);
      jest
        .spyOn(appTokenRepository, 'create')
        .mockReturnValue(mockToken as AppToken);
      jest
        .spyOn(appTokenRepository, 'save')
        .mockResolvedValue(mockToken as AppToken);

      const result = await service.generateToken(userId, email);

      expect(result).toEqual({
        token: mockToken.id,
        expiresAt: expect.any(Date),
      });
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

  describe('verifyToken', () => {
    it('should verify token and mark email as verified', async () => {
      const mockToken = 'valid-token';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };
      const mockAppToken = {
        id: mockToken,
        userId: mockUser.id,
        type: AppTokenType.EmailVerificationToken,
        expiresAt: new Date(Date.now() + 86400000), // 24h from now
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppToken);
      jest
        .spyOn(userService, 'markEmailAsVerified')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(appTokenRepository, 'remove')
        .mockResolvedValue(mockAppToken as AppToken);

      const result = await service.verifyToken(mockToken);

      expect(result).toEqual({
        success: true,
        email: mockUser.email,
      });
      expect(userService.markEmailAsVerified).toHaveBeenCalledWith(mockUser.id);
      expect(appTokenRepository.remove).toHaveBeenCalledWith(mockAppToken);
    });

    it('should throw exception for invalid token', async () => {
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        new EmailVerificationException(
          'Invalid token',
          EmailVerificationExceptionCode.INVALID_TOKEN,
        ),
      );
    });

    it('should throw exception for wrong token type', async () => {
      const mockAppToken = {
        id: 'token-id',
        type: AppTokenType.PasswordResetToken,
        expiresAt: new Date(Date.now() + 86400000),
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppToken);

      await expect(service.verifyToken('wrong-type-token')).rejects.toThrow(
        new EmailVerificationException(
          'Invalid token type',
          EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE,
        ),
      );
    });

    it('should throw exception for expired token', async () => {
      const mockAppToken = {
        id: 'token-id',
        type: AppTokenType.EmailVerificationToken,
        expiresAt: new Date(Date.now() - 86400000), // 24h ago
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockAppToken as AppToken);

      await expect(service.verifyToken('expired-token')).rejects.toThrow(
        new EmailVerificationException(
          'Token expired',
          EmailVerificationExceptionCode.TOKEN_EXPIRED,
        ),
      );
    });
  });
});
