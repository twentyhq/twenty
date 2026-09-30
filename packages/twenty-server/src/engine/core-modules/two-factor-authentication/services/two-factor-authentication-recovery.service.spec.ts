import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { renderEmail } from 'twenty-emails';
import { IsNull, QueryFailedError } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationRecoveryCodeEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-recovery-code.entity';
import { TwoFactorAuthenticationRecoveryService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-recovery.service';
import { TwoFactorAuthenticationExceptionCode } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-recovery-code-redemption-rate-limit-key.util';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
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
  let transactionalRepositories: {
    recoveryCode: { update: jest.Mock };
    method: { delete: jest.Mock };
    appToken: { update: jest.Mock };
  };
  let twoFactorAuthenticationService: {
    assertFreshStepUpAuthenticationOrThrow: jest.Mock;
    emitTwoFactorAuthenticationEvent: jest.Mock;
    revokePendingRecoveryCodes: jest.Mock;
  };
  let userWorkspaceService: { getUserWorkspaceForUser: jest.Mock };
  let userSessionService: { revokeAllSessionsForUser: jest.Mock };
  let throttlerService: { atomicTokenBucketThrottleOrThrow: jest.Mock };
  let emailService: { send: jest.Mock };
  let featureFlagService: { isFeatureEnabled: jest.Mock };

  beforeEach(async () => {
    transactionalRepositories = {
      recoveryCode: { update: jest.fn().mockResolvedValue({ affected: 1 }) },
      method: { delete: jest.fn() },
      appToken: { update: jest.fn() },
    };

    const entityManager = {
      getRepository: (entity: unknown) => {
        if (entity === TwoFactorAuthenticationRecoveryCodeEntity) {
          return transactionalRepositories.recoveryCode;
        }

        if (entity === TwoFactorAuthenticationMethodEntity) {
          return transactionalRepositories.method;
        }

        return transactionalRepositories.appToken;
      },
    };

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
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            manager: {
              transaction: jest.fn(
                (callback: (manager: typeof entityManager) => unknown) =>
                  callback(entityManager),
              ),
            },
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
          provide: UserSessionService,
          useValue: { revokeAllSessionsForUser: jest.fn() },
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
        {
          provide: FeatureFlagService,
          useValue: { isFeatureEnabled: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get(TwoFactorAuthenticationRecoveryService);
    recoveryCodeRepository = module.get(
      getWorkspaceScopedRepositoryToken(
        TwoFactorAuthenticationRecoveryCodeEntity,
      ),
    );
    twoFactorAuthenticationService = module.get(TwoFactorAuthenticationService);
    userWorkspaceService = module.get(UserWorkspaceService);
    userSessionService = module.get(UserSessionService);
    throttlerService = module.get(ThrottlerService);
    emailService = module.get(EmailService);
    featureFlagService = module.get(FeatureFlagService);
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

    it('refuses a user who is not a member of the workspace', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
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

  describe('redeemRecoveryCode', () => {
    const redeem = () =>
      service.redeemRecoveryCode({
        userId: TARGET_USER_ID,
        workspace: { id: WORKSPACE_ID, displayName: 'Apple' },
        recoveryCode: 'abcde-fghjk-mnpqr-stvwx',
      });

    const redeemableCodeWhere = {
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: TARGET_USER_WORKSPACE_ID,
      codeHash: hashTwoFactorAuthenticationRecoveryCode('ABCDEFGHJKMNPQRSTVWX'),
      usedAt: IsNull(),
      revokedAt: IsNull(),
    };

    it('consumes the code, removes the authenticator and revokes refresh tokens together, then signs out the member', async () => {
      await redeem();

      expect(
        throttlerService.atomicTokenBucketThrottleOrThrow,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          key: buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey({
            userWorkspaceId: TARGET_USER_WORKSPACE_ID,
          }),
        }),
      );
      expect(
        transactionalRepositories.recoveryCode.update,
      ).toHaveBeenCalledWith(expect.objectContaining(redeemableCodeWhere), {
        usedAt: expect.any(Date),
      });
      expect(transactionalRepositories.method.delete).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: TARGET_USER_WORKSPACE_ID,
      });
      expect(transactionalRepositories.appToken.update).toHaveBeenCalledWith(
        {
          userId: TARGET_USER_ID,
          workspaceId: WORKSPACE_ID,
          type: AppTokenType.RefreshToken,
          revokedAt: IsNull(),
        },
        { revokedAt: expect.any(Date) },
      );
      expect(userSessionService.revokeAllSessionsForUser).toHaveBeenCalledWith({
        userId: TARGET_USER_ID,
        workspaceId: WORKSPACE_ID,
        reason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
      });
      expect(
        transactionalRepositories.recoveryCode.update.mock
          .invocationCallOrder[0],
      ).toBeLessThan(
        userSessionService.revokeAllSessionsForUser.mock.invocationCallOrder[0],
      );
      expect(
        twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userId: TARGET_USER_ID,
        action: 'recovery_code_used',
      });
      expect(emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'target@example.com' }),
      );
    });

    it('rejects an unknown, expired, used or revoked code without signing anyone out', async () => {
      transactionalRepositories.recoveryCode.update.mockResolvedValue({
        affected: 0,
      });

      await expect(redeem()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.INVALID_RECOVERY_CODE,
      });
      expect(
        twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userId: TARGET_USER_ID,
        action: 'recovery_code_rejected',
      });
      expect(
        userSessionService.revokeAllSessionsForUser,
      ).not.toHaveBeenCalled();
      expect(transactionalRepositories.method.delete).not.toHaveBeenCalled();
      expect(emailService.send).not.toHaveBeenCalled();
    });

    it('refuses every code while the feature flag is off', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      await expect(redeem()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.INVALID_RECOVERY_CODE,
      });
      expect(
        transactionalRepositories.recoveryCode.update,
      ).not.toHaveBeenCalled();
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
  });

  describe('getRecoveryStatus', () => {
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
