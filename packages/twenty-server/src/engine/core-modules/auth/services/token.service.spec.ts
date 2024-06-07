import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import crypto from 'crypto';

import { IsNull, MoreThan, Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let environmentService: EnvironmentService;
  let userRepository: Repository<User>;
  let appTokenRepository: Repository<AppToken>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: JwtAuthStrategy,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn().mockReturnValue('some-value'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    userRepository = module.get(getRepositoryToken(User, 'core'));
    appTokenRepository = module.get(getRepositoryToken(AppToken, 'core'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a new password reset token when no existing token is found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      const expiresIn = '3600000'; // 1 hour in ms

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(environmentService, 'get').mockReturnValue(expiresIn);
      jest
        .spyOn(appTokenRepository, 'save')
        .mockImplementation(async (token) => token as AppToken);

      const result = await service.generatePasswordResetToken(mockUser.email);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(appTokenRepository.findOne).toHaveBeenCalled();
      expect(appTokenRepository.save).toHaveBeenCalled();
      expect(result.passwordResetToken).toBeDefined();
      expect(result.passwordResetTokenExpiresAt).toBeDefined();
    });

    it('should throw BadRequestException if an existing valid token is found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      const mockToken = {
        userId: '1',
        type: AppTokenType.PasswordResetToken,
        expiresAt: new Date(Date.now() + 10000), // expires 10 seconds in the future
      } as AppToken;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(mockToken);
      jest.spyOn(environmentService, 'get').mockReturnValue('3600000');

      await expect(
        service.generatePasswordResetToken(mockUser.email),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if no user is found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.generatePasswordResetToken('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if environment variable is not found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(environmentService, 'get').mockReturnValue(''); // No environment variable set

      await expect(
        service.generatePasswordResetToken(mockUser.email),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validatePasswordResetToken', () => {
    it('should return user data for a valid and active token', async () => {
      const resetToken = 'valid-reset-token';
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const mockToken = {
        userId: '1',
        value: hashedToken,
        type: AppTokenType.PasswordResetToken,
        expiresAt: new Date(Date.now() + 10000), // Valid future date
      };
      const mockUser = { id: '1', email: 'user@example.com' };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockToken as AppToken);
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);

      const result = await service.validatePasswordResetToken(resetToken);

      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          value: hashedToken,
          type: AppTokenType.PasswordResetToken,
          expiresAt: MoreThan(new Date()),
          revokedAt: IsNull(),
        },
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockToken.userId,
      });
      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
    });

    it('should throw NotFoundException if token is invalid or expired', async () => {
      const resetToken = 'invalid-reset-token';

      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validatePasswordResetToken(resetToken),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user does not exist for a valid token', async () => {
      const resetToken = 'orphan-token';
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const mockToken = {
        userId: 'nonexistent-user',
        value: hashedToken,
        type: AppTokenType.PasswordResetToken,
        expiresAt: new Date(Date.now() + 10000), // Valid future date
        revokedAt: null,
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockToken as AppToken);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.validatePasswordResetToken(resetToken),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if token is revoked', async () => {
      const resetToken = 'revoked-token';
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const mockToken = {
        userId: '1',
        value: hashedToken,
        type: AppTokenType.PasswordResetToken,
        expiresAt: new Date(Date.now() + 10000),
        revokedAt: new Date(),
      };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockToken as AppToken);
      await expect(
        service.validatePasswordResetToken(resetToken),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
