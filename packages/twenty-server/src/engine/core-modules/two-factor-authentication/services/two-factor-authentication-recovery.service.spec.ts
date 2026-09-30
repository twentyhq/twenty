import { Test, type TestingModule } from '@nestjs/testing';

import { renderEmail } from 'twenty-emails';
import { QueryFailedError } from 'typeorm';

import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationRecoveryCodeEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-recovery-code.entity';
import { TwoFactorAuthenticationRecoveryService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-recovery.service';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

jest.mock('twenty-emails', () => ({
  ...jest.requireActual('twenty-emails'),
  renderEmail: jest.fn().mockResolvedValue('email'),
}));

const WORKSPACE_ID = 'workspace-id';
const TARGET_USER_ID = 'target-user-id';
const TARGET_USER_WORKSPACE_ID = 'target-user-workspace-id';

const ACTOR = {
  id: 'actor-user-id',
  firstName: 'Jane',
  lastName: 'Admin',
  canImpersonate: false,
  canAccessFullAdminPanel: false,
};

const buildTargetUserWorkspace = ({
  canImpersonate = false,
  canAccessFullAdminPanel = false,
}: {
  canImpersonate?: boolean;
  canAccessFullAdminPanel?: boolean;
} = {}) => ({
  id: TARGET_USER_WORKSPACE_ID,
  userId: TARGET_USER_ID,
  workspaceId: WORKSPACE_ID,
  locale: 'en',
  user: {
    id: TARGET_USER_ID,
    email: 'target@example.com',
    canImpersonate,
    canAccessFullAdminPanel,
  },
  workspace: { id: WORKSPACE_ID, displayName: 'Apple' },
});

describe('TwoFactorAuthenticationRecoveryService', () => {
  let service: TwoFactorAuthenticationRecoveryService;
  let recoveryCodeRepository: {
    insert: jest.Mock;
    findOne: jest.Mock;
  };
  let methodRepository: { exists: jest.Mock };
  let twoFactorAuthenticationService: {
    assertFreshStepUpAuthenticationOrThrow: jest.Mock;
    emitTwoFactorAuthenticationEvent: jest.Mock;
    revokePendingRecoveryCodes: jest.Mock;
  };
  let userWorkspaceService: { getUserWorkspaceForUser: jest.Mock };
  let throttlerService: { atomicTokenBucketThrottleOrThrow: jest.Mock };
  let emailService: { send: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationRecoveryService,
        {
          provide: getWorkspaceScopedRepositoryToken(
            TwoFactorAuthenticationRecoveryCodeEntity,
          ),
          useValue: {
            insert: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(
            TwoFactorAuthenticationMethodEntity,
          ),
          useValue: {
            exists: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: TwoFactorAuthenticationService,
          useValue: {
            assertFreshStepUpAuthenticationOrThrow: jest.fn(),
            emitTwoFactorAuthenticationEvent: jest.fn(),
            revokePendingRecoveryCodes: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            getUserWorkspaceForUser: jest
              .fn()
              .mockResolvedValue(buildTargetUserWorkspace()),
          },
        },
        {
          provide: ThrottlerService,
          useValue: { atomicTokenBucketThrottleOrThrow: jest.fn() },
        },
        { provide: EmailService, useValue: { send: jest.fn() } },
        {
          provide: I18nService,
          useValue: {
            getI18nInstance: () => ({
              _: (message: { message?: string }) => message.message ?? '',
            }),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: (key: string) =>
              key === 'TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_EXPIRES_IN'
                ? '1h'
                : 'noreply@example.com',
          },
        },
      ],
    }).compile();

    service = module.get(TwoFactorAuthenticationRecoveryService);
    recoveryCodeRepository = module.get(
      getWorkspaceScopedRepositoryToken(
        TwoFactorAuthenticationRecoveryCodeEntity,
      ),
    );
    methodRepository = module.get(
      getWorkspaceScopedRepositoryToken(TwoFactorAuthenticationMethodEntity),
    );
    twoFactorAuthenticationService = module.get(TwoFactorAuthenticationService);
    userWorkspaceService = module.get(UserWorkspaceService);
    throttlerService = module.get(ThrottlerService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRecoveryCode', () => {
    const generate = () =>
      service.generateRecoveryCode({
        actor: ACTOR,
        actorWorkspaceId: WORKSPACE_ID,
        otp: '123456',
        targetUserId: TARGET_USER_ID,
        targetWorkspaceId: WORKSPACE_ID,
      });

    it('stores only a hash of the code, replaces pending codes and notifies the member', async () => {
      const before = Date.now();

      const { recoveryCode, expiresAt } = await generate();

      expect(recoveryCode).toMatch(/^[0-9A-Z]{5}(-[0-9A-Z]{5}){3}$/);
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + 60 * 60 * 1000,
      );
      expect(
        twoFactorAuthenticationService.assertFreshStepUpAuthenticationOrThrow,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: ACTOR.id,
          workspaceId: WORKSPACE_ID,
          otp: '123456',
        }),
      );
      expect(
        twoFactorAuthenticationService.revokePendingRecoveryCodes,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: TARGET_USER_WORKSPACE_ID,
      });
      expect(recoveryCodeRepository.insert).toHaveBeenCalledWith(WORKSPACE_ID, {
        userWorkspaceId: TARGET_USER_WORKSPACE_ID,
        codeHash: hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
        issuedByUserId: ACTOR.id,
        expiresAt,
      });
      expect(
        twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userId: ACTOR.id,
        action: 'recovery_code_issued',
        targetUserId: TARGET_USER_ID,
      });
      expect(emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'target@example.com' }),
      );
      expect(
        JSON.stringify((renderEmail as jest.Mock).mock.calls[0][0].props),
      ).not.toContain(recoveryCode);
    });

    it('refuses to target the actor', async () => {
      await expect(
        service.generateRecoveryCode({
          actor: ACTOR,
          actorWorkspaceId: WORKSPACE_ID,
          otp: '123456',
          targetUserId: ACTOR.id,
          targetWorkspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(
        twoFactorAuthenticationService.assertFreshStepUpAuthenticationOrThrow,
      ).not.toHaveBeenCalled();
      expect(recoveryCodeRepository.insert).not.toHaveBeenCalled();
    });

    it('does nothing when the step-up code is rejected', async () => {
      twoFactorAuthenticationService.assertFreshStepUpAuthenticationOrThrow.mockRejectedValue(
        new TwoFactorAuthenticationException(
          'Invalid OTP',
          TwoFactorAuthenticationExceptionCode.INVALID_OTP,
        ),
      );

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      });
      expect(
        userWorkspaceService.getUserWorkspaceForUser,
      ).not.toHaveBeenCalled();
      expect(recoveryCodeRepository.insert).not.toHaveBeenCalled();
    });

    it('refuses a target with server admin privileges the actor lacks', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(
        buildTargetUserWorkspace({ canAccessFullAdminPanel: true }),
      );

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(recoveryCodeRepository.insert).not.toHaveBeenCalled();
    });

    it('lets a server admin generate a code for another server admin', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(
        buildTargetUserWorkspace({ canImpersonate: true }),
      );

      await service.generateRecoveryCode({
        actor: { ...ACTOR, canAccessFullAdminPanel: true },
        actorWorkspaceId: WORKSPACE_ID,
        otp: '123456',
        targetUserId: TARGET_USER_ID,
        targetWorkspaceId: WORKSPACE_ID,
      });

      expect(recoveryCodeRepository.insert).toHaveBeenCalled();
    });

    it('refuses a member without a verified method', async () => {
      methodRepository.exists.mockResolvedValue(false);

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(recoveryCodeRepository.insert).not.toHaveBeenCalled();
    });

    it('refuses a user who is not a member of the workspace', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
    });

    it('stops once the actor has issued too many codes', async () => {
      throttlerService.atomicTokenBucketThrottleOrThrow.mockRejectedValue(
        new ThrottlerException(
          'Limit reached',
          ThrottlerExceptionCode.LIMIT_REACHED,
        ),
      );

      await expect(generate()).rejects.toThrow(ThrottlerException);
      expect(recoveryCodeRepository.insert).not.toHaveBeenCalled();
    });

    it('reports a conflict when another code was issued for the member at the same time', async () => {
      recoveryCodeRepository.insert.mockRejectedValue(
        Object.assign(new QueryFailedError('INSERT', [], new Error()), {
          code: '23505',
        }),
      );

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_ISSUANCE_CONFLICT,
      });
      expect(emailService.send).not.toHaveBeenCalled();
    });

    it('keeps the code when the notification email fails', async () => {
      emailService.send.mockRejectedValue(new Error('SMTP down'));

      await expect(generate()).resolves.toEqual(
        expect.objectContaining({ recoveryCode: expect.any(String) }),
      );
    });
  });

  describe('revokeRecoveryCode', () => {
    it('revokes the pending code and records who revoked it', async () => {
      twoFactorAuthenticationService.revokePendingRecoveryCodes.mockResolvedValue(
        1,
      );

      await expect(
        service.revokeRecoveryCode({
          actor: ACTOR,
          targetUserId: TARGET_USER_ID,
          targetWorkspaceId: WORKSPACE_ID,
        }),
      ).resolves.toBe(true);
      expect(
        twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userId: ACTOR.id,
        action: 'recovery_code_revoked',
        targetUserId: TARGET_USER_ID,
      });
    });

    it('refuses to revoke a server administrator code for an actor without those privileges', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(
        buildTargetUserWorkspace({ canImpersonate: true }),
      );

      await expect(
        service.revokeRecoveryCode({
          actor: ACTOR,
          targetUserId: TARGET_USER_ID,
          targetWorkspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(
        twoFactorAuthenticationService.revokePendingRecoveryCodes,
      ).not.toHaveBeenCalled();
    });

    it('reports when there was nothing to revoke', async () => {
      await expect(
        service.revokeRecoveryCode({
          actor: ACTOR,
          targetUserId: TARGET_USER_ID,
          targetWorkspaceId: WORKSPACE_ID,
        }),
      ).resolves.toBe(false);
      expect(
        twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getRecoveryStatus', () => {
    it('returns whether the member has a verified method and when a pending code expires', async () => {
      const expiresAt = new Date(Date.now() + 60_000);

      recoveryCodeRepository.findOne.mockResolvedValue({ expiresAt });

      await expect(
        service.getRecoveryStatus({
          actor: ACTOR,
          targetUserId: TARGET_USER_ID,
          targetWorkspaceId: WORKSPACE_ID,
        }),
      ).resolves.toEqual({
        hasVerifiedTwoFactorAuthenticationMethod: true,
        pendingRecoveryCodeExpiresAt: expiresAt,
      });
    });

    it('hides a server administrator status from an actor without those privileges', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(
        buildTargetUserWorkspace({ canImpersonate: true }),
      );

      await expect(
        service.getRecoveryStatus({
          actor: ACTOR,
          targetUserId: TARGET_USER_ID,
          targetWorkspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(recoveryCodeRepository.findOne).not.toHaveBeenCalled();
    });
  });
});
