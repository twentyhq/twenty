import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { ResetPasswordService } from './reset-password.service';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let userRepository: Repository<User>;
  let workspaceRepository: Repository<Workspace>;
  let appTokenRepository: Repository<AppToken>;
  let emailService: EmailService;
  let twentyConfigService: TwentyConfigService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordService,
        {
          provide: getRepositoryToken(User, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useClass: Repository,
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            getBaseUrl: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
            buildWorkspaceURL: jest.fn(),
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

    service = module.get<ResetPasswordService>(ResetPasswordService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User, 'core'),
    );
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    appTokenRepository = module.get<Repository<AppToken>>(
      getRepositoryToken(AppToken, 'core'),
    );
    emailService = module.get<EmailService>(EmailService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a password reset token for a valid user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(appTokenRepository, 'save').mockResolvedValue({} as AppToken);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      const result = await service.generatePasswordResetToken(
        'test@example.com',
        'workspace-id',
      );

      expect(result.passwordResetToken).toBeDefined();
      expect(result.passwordResetTokenExpiresAt).toBeDefined();
      expect(appTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '1',
          type: AppTokenType.PasswordResetToken,
        }),
      );
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.generatePasswordResetToken(
          'nonexistent@example.com',
          'workspace-id',
        ),
      ).rejects.toThrow(AuthException);
    });

    it('should throw an error if a token already exists', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockExistingToken = {
        userId: '1',
        type: AppTokenType.PasswordResetToken,
        workspaceId: 'workspace-id',
        expiresAt: addMilliseconds(new Date(), 3600000),
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);
      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockExistingToken as AppToken);

      await expect(
        service.generatePasswordResetToken('test@example.com', 'workspace-id'),
      ).rejects.toThrow(AuthException);
    });
  });

  describe('sendEmailPasswordResetLink', () => {
    it('should send a password reset email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockToken = {
        workspaceId: 'workspace-id',
        passwordResetToken: 'token123',
        passwordResetTokenExpiresAt: new Date(),
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);
      jest
        .spyOn(workspaceRepository, 'findOneBy')
        .mockResolvedValue({ id: 'workspace-id' } as Workspace);
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('http://localhost:3000');
      jest
        .spyOn(domainManagerService, 'buildWorkspaceURL')
        .mockReturnValue(
          new URL(
            'https://subdomain.localhost.com:3000/reset-password/passwordResetToken',
          ),
        );

      const result = await service.sendEmailPasswordResetLink(
        mockToken,
        'test@example.com',
        'en',
      );

      expect(result.success).toBe(true);
      expect(emailService.send).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.sendEmailPasswordResetLink(
          {} as any,
          'nonexistent@example.com',
          'en',
        ),
      ).rejects.toThrow(AuthException);
    });
  });

  describe('validatePasswordResetToken', () => {
    it('should validate a correct password reset token', async () => {
      const mockToken = {
        userId: '1',
        type: AppTokenType.PasswordResetToken,
        expiresAt: addMilliseconds(new Date(), 3600000),
      };
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockToken as AppToken);
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);

      const result = await service.validatePasswordResetToken('validToken');

      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });

    it('should throw an error for an invalid token', async () => {
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validatePasswordResetToken('invalidToken'),
      ).rejects.toThrow(AuthException);
    });
  });

  describe('invalidatePasswordResetToken', () => {
    it('should invalidate an existing password reset token', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);
      jest.spyOn(appTokenRepository, 'update').mockResolvedValue({} as any);

      const result = await service.invalidatePasswordResetToken('1');

      expect(result.success).toBe(true);
      expect(appTokenRepository.update).toHaveBeenCalledWith(
        { userId: '1', type: AppTokenType.PasswordResetToken },
        { revokedAt: expect.any(Date) },
      );
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.invalidatePasswordResetToken('nonexistent'),
      ).rejects.toThrow(AuthException);
    });
  });
});
