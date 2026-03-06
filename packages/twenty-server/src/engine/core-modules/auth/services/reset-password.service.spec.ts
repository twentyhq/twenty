import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { ResetPasswordService } from './reset-password.service';

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockImplementation(async (_, options) => {
    if (options?.plainText) {
      return 'Plain Text Email';
    }

    return '<html><body>HTML email content</body></html>';
  }),
}));

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let userService: UserService;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let appTokenRepository: Repository<AppTokenEntity>;
  let emailService: EmailService;
  let twentyConfigService: TwentyConfigService;
  let workspaceDomainsService: WorkspaceDomainsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordService,
        {
          provide: UserService,
          useValue: {
            findUserByEmailOrThrow: jest.fn(),
            findUserByIdOrThrow: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            getI18nInstance: jest.fn().mockReturnValue({
              _: jest.fn().mockReturnValue('mocked-translation'),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ResetPasswordService>(ResetPasswordService);
    userService = module.get<UserService>(UserService);
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );
    emailService = module.get<EmailService>(EmailService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    workspaceDomainsService = module.get<WorkspaceDomainsService>(
      WorkspaceDomainsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a password reset token for a valid user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(appTokenRepository, 'save')
        .mockResolvedValue({} as AppTokenEntity);
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
          workspaceId: 'workspace-id',
          type: AppTokenType.PasswordResetToken,
        }),
      );
    });

    it('should resolve workspace when workspaceId is missing', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockWorkspace = { id: 'resolved-workspace-id' };

      jest
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest.spyOn(appTokenRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(appTokenRepository, 'save')
        .mockResolvedValue({} as AppTokenEntity);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      const result =
        await service.generatePasswordResetToken('test@example.com');

      expect(result.workspaceId).toBe('resolved-workspace-id');
      expect(appTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'resolved-workspace-id',
        }),
      );
    });

    it('should throw an error if no password auth enabled workspace found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      await expect(
        service.generatePasswordResetToken('test@example.com'),
      ).rejects.toThrow(AuthException);
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockRejectedValue(
          new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
        );

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
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(appTokenRepository, 'findOne')
        .mockResolvedValue(mockExistingToken as AppTokenEntity);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

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
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOneBy')
        .mockResolvedValue({ id: 'workspace-id' } as WorkspaceEntity);
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('http://localhost:3000');
      jest
        .spyOn(workspaceDomainsService, 'buildWorkspaceURL')
        .mockReturnValue(
          new URL(
            'https://subdomain.localhost.com:3000/reset-password/passwordResetToken',
          ),
        );

      const result = await service.sendEmailPasswordResetLink({
        resetToken: mockToken,
        email: 'test@example.com',
        locale: 'en',
      });

      expect(result.success).toBe(true);
      expect(emailService.send).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      const mockToken = {
        workspaceId: 'workspace-id',
        passwordResetToken: 'token123',
        passwordResetTokenExpiresAt: new Date(),
      };

      jest
        .spyOn(userService, 'findUserByEmailOrThrow')
        .mockRejectedValue(
          new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
        );

      await expect(
        service.sendEmailPasswordResetLink({
          resetToken: mockToken,
          email: 'nonexistent@example.com',
          locale: 'en',
        }),
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
        .mockResolvedValue(mockToken as AppTokenEntity);
      jest
        .spyOn(userService, 'findUserByIdOrThrow')
        .mockResolvedValue(mockUser as UserEntity);

      const result = await service.validatePasswordResetToken('validToken');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        hasPassword: false,
      });
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
        .spyOn(userService, 'findUserByIdOrThrow')
        .mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(appTokenRepository, 'update').mockResolvedValue({} as any);

      const result = await service.invalidatePasswordResetToken('1');

      expect(result.success).toBe(true);
      expect(appTokenRepository.update).toHaveBeenCalledWith(
        { userId: '1', type: AppTokenType.PasswordResetToken },
        { revokedAt: expect.any(Date) },
      );
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(userService, 'findUserByIdOrThrow')
        .mockRejectedValue(
          new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
        );

      await expect(
        service.invalidatePasswordResetToken('nonexistent'),
      ).rejects.toThrow(AuthException);
    });
  });
});
