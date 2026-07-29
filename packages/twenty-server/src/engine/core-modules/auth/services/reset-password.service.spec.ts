import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import { type EntityManager, Repository } from 'typeorm';

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

// render() resolves through a streaming scheduler that never advances under the
// globally enabled fake timers; the real render path is covered by
// email-templates-rendering.spec.ts.
jest.mock('twenty-emails', () => ({
  ...jest.requireActual('twenty-emails'),
  renderEmail: jest.fn().mockImplementation(async (_template, options) => {
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
            findUserByEmail: jest.fn(),
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

  const mockAppTokenTransaction = () => {
    const updateSpy = jest.fn().mockResolvedValue({ affected: 1 });
    const saveSpy = jest.fn().mockResolvedValue({} as AppTokenEntity);

    Object.defineProperty(appTokenRepository, 'manager', {
      configurable: true,
      value: {
        transaction: (
          runInTransaction: (entityManager: EntityManager) => Promise<unknown>,
        ) =>
          runInTransaction({
            getRepository: () => ({ update: updateSpy, save: saveSpy }),
          } as unknown as EntityManager),
      },
    });

    return { updateSpy, saveSpy };
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a password reset token for a valid user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue({ id: 'workspace-id' } as WorkspaceEntity);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      const result = await service.generatePasswordResetToken(
        'test@example.com',
        'workspace-id',
      );

      expect(result).toEqual(
        expect.objectContaining({
          status: 'TOKEN_GENERATED',
          resetToken: expect.objectContaining({
            passwordResetToken: expect.any(String),
            passwordResetTokenExpiresAt: expect.any(Date),
            workspaceId: 'workspace-id',
          }),
        }),
      );
      expect(workspaceRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'workspace-id',
            isPasswordAuthEnabled: true,
          }),
        }),
      );
    });

    it('falls back to the user own workspace when the provided workspaceId is not one they belong to', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'fallback-workspace-id',
        } as WorkspaceEntity);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      const result = await service.generatePasswordResetToken(
        'test@example.com',
        'foreign-workspace-id',
      );

      expect(result).toEqual(
        expect.objectContaining({
          status: 'TOKEN_GENERATED',
          resetToken: expect.objectContaining({
            workspaceId: 'fallback-workspace-id',
          }),
          workspace: expect.objectContaining({ id: 'fallback-workspace-id' }),
        }),
      );
    });

    it('should resolve workspace when workspaceId is missing', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockWorkspace = { id: 'resolved-workspace-id' };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');

      const result =
        await service.generatePasswordResetToken('test@example.com');

      expect(result).toEqual(
        expect.objectContaining({
          status: 'TOKEN_GENERATED',
          resetToken: expect.objectContaining({
            workspaceId: 'resolved-workspace-id',
          }),
          workspace: expect.objectContaining({ id: 'resolved-workspace-id' }),
        }),
      );
    });

    it('should return a status instead of sending when no password auth enabled workspace is found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);

      const result =
        await service.generatePasswordResetToken('test@example.com');

      expect(result).toEqual({
        status: 'NO_PASSWORD_AUTH_ENABLED_WORKSPACE_FOUND',
      });
    });

    it('should return a status instead of sending when the user is unknown', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      const result = await service.generatePasswordResetToken(
        'nonexistent@example.com',
        'workspace-id',
      );

      expect(result).toEqual({ status: 'USER_NOT_FOUND' });
    });

    it('should throw when the reset token expiration config is missing', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue({ id: 'workspace-id' } as WorkspaceEntity);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(undefined);

      await expect(
        service.generatePasswordResetToken('test@example.com', 'workspace-id'),
      ).rejects.toMatchObject({
        code: AuthExceptionCode.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('rotatePasswordResetToken', () => {
    const mockResetToken = {
      workspaceId: 'workspace-id',
      passwordResetToken: 'plain-token',
      passwordResetTokenExpiresAt: addMilliseconds(new Date(), 3600000),
    };

    it('should revoke the previous tokens and save the hashed one in a single transaction', async () => {
      const { updateSpy, saveSpy } = mockAppTokenTransaction();

      await service.rotatePasswordResetToken({
        userId: '1',
        resetToken: mockResetToken,
      });

      expect(updateSpy).toHaveBeenCalledWith(
        { userId: '1', type: AppTokenType.PasswordResetToken },
        { revokedAt: expect.any(Date) },
      );
      expect(saveSpy).toHaveBeenCalledWith({
        userId: '1',
        workspaceId: 'workspace-id',
        value: expect.any(String),
        expiresAt: mockResetToken.passwordResetTokenExpiresAt,
        type: AppTokenType.PasswordResetToken,
      });
      expect(saveSpy.mock.calls[0][0].value).not.toBe('plain-token');
    });

    it('should rethrow repository errors', async () => {
      const { saveSpy } = mockAppTokenTransaction();

      saveSpy.mockRejectedValue(new Error('db down'));

      await expect(
        service.rotatePasswordResetToken({
          userId: '1',
          resetToken: mockResetToken,
        }),
      ).rejects.toThrow('db down');
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
        user: mockUser as UserEntity,
        workspace: { id: 'workspace-id' } as WorkspaceEntity,
        locale: 'en',
      });

      expect(result.success).toBe(true);
      expect(emailService.send).toHaveBeenCalled();
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
