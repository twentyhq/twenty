import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailVerificationException } from 'src/engine/core-modules/email-verification/email-verification.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';

import { EmailVerificationTokenService } from './email-verification-token.service';

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
}));

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate an email verification token successfully', async () => {
      const userId = 'user-id';
      const email = 'test@example.com';
      const mockExpiresIn = '24h';
      const mockRandomBytes = Buffer.from('mock-random-bytes');
      const mockToken = {
        id: 'token-id',
        value: mockRandomBytes.toString('hex'),
      };

      jest.spyOn(environmentService, 'get').mockReturnValue(mockExpiresIn);
      jest.spyOn(appTokenRepository, 'create').mockReturnValue({
        ...mockToken,
        userId,
        type: AppTokenType.EmailVerificationToken,
        context: { email },
      } as AppToken);
      jest.spyOn(appTokenRepository, 'save').mockResolvedValue({
        ...mockToken,
        userId,
        type: AppTokenType.EmailVerificationToken,
        context: { email },
      } as AppToken);

      const result = await service.generateToken(userId, email);

      expect(result).toEqual({
        token: mockToken.id,
        expiresAt: expect.any(Date),
      });
      expect(environmentService.get).toHaveBeenCalledWith(
        'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
      );
      expect(appTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should verify token and mark email as verified successfully', async () => {
      const mockToken = 'valid-token';
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockAppToken = {
        id: mockToken,
        userId: mockUser.id,
        type: AppTokenType.EmailVerificationToken,
        user: mockUser,
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
      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockToken,
          type: AppTokenType.EmailVerificationToken,
        },
        relations: ['user'],
      });
      expect(userService.markEmailAsVerified).toHaveBeenCalledWith(mockUser.id);
      expect(appTokenRepository.remove).toHaveBeenCalledWith(mockAppToken);
    });

    it('should throw an error if token is not found', async () => {
      const mockToken = 'invalid-token';

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(service.verifyToken(mockToken)).rejects.toThrow(
        EmailVerificationException,
      );
    });
  });
});
