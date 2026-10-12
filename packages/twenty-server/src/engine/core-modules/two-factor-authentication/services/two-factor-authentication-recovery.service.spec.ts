import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { renderEmail } from 'twenty-emails';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import {
  IsNull,
  MoreThan,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
} from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationRecoveryService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-recovery.service';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
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
const MEMBERSHIP_CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const REPLACEMENT_PROVISIONING_URI =
  'otpauth://totp/Twenty%20-%20Apple:target@example.com?secret=REPLACEMENT';

const ACTOR = {
  id: 'actor-user-id',
  email: 'admin@example.com',
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
  createdAt: MEMBERSHIP_CREATED_AT,
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
  let appTokenRepository: {
    insert: jest.Mock;
    findOne: jest.Mock;
    exists: jest.Mock;
  };
  let methodRepository: { exists: jest.Mock };
  let transactionalRepositories: {
    method: { delete: jest.Mock; insert: jest.Mock };
    appToken: { update: jest.Mock; createQueryBuilder: jest.Mock };
  };
  let refreshTokenRevocationQueryBuilder: {
    update: jest.Mock;
    set: jest.Mock;
    where: jest.Mock;
    setParameters: jest.Mock;
    execute: jest.Mock;
  };
  let twoFactorAuthenticationService: {
    assertFreshStepUpAuthenticationOrThrow: jest.Mock;
    revokeRecoveryCodes: jest.Mock;
    generatePendingTotpSecret: jest.Mock;
  };
  let userWorkspaceService: { getUserWorkspaceForUser: jest.Mock };
  let userSessionService: { revokeAllSessionsForUser: jest.Mock };
  let throttlerService: { tokenBucketThrottleOrThrow: jest.Mock };
  let emailService: { send: jest.Mock };

  beforeEach(async () => {
    refreshTokenRevocationQueryBuilder = {
      update: jest.fn(() => refreshTokenRevocationQueryBuilder),
      set: jest.fn(() => refreshTokenRevocationQueryBuilder),
      where: jest.fn(() => refreshTokenRevocationQueryBuilder),
      setParameters: jest.fn(() => refreshTokenRevocationQueryBuilder),
      execute: jest.fn(),
    };
    transactionalRepositories = {
      method: { delete: jest.fn(), insert: jest.fn() },
      appToken: {
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        createQueryBuilder: jest.fn(() => refreshTokenRevocationQueryBuilder),
      },
    };

    const entityManager = {
      query: jest.fn(),
      getRepository: (entity: unknown) => {
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
            TwoFactorAuthenticationMethodEntity,
          ),
          useValue: {
            exists: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            insert: jest.fn(),
            findOne: jest.fn(),
            exists: jest.fn().mockResolvedValue(false),
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
            revokeRecoveryCodes: jest.fn().mockResolvedValue(0),
            generatePendingTotpSecret: jest.fn().mockReturnValue({
              uri: REPLACEMENT_PROVISIONING_URI,
              encryptedSecret: 'encrypted-replacement-secret',
              status: OTPStatus.PENDING,
            }),
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
          useValue: { tokenBucketThrottleOrThrow: jest.fn() },
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
    appTokenRepository = module.get(getRepositoryToken(AppTokenEntity));
    methodRepository = module.get(
      getWorkspaceScopedRepositoryToken(TwoFactorAuthenticationMethodEntity),
    );
    twoFactorAuthenticationService = module.get(TwoFactorAuthenticationService);
    userWorkspaceService = module.get(UserWorkspaceService);
    userSessionService = module.get(UserSessionService);
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
        twoFactorAuthenticationService.revokeRecoveryCodes,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userId: TARGET_USER_ID,
      });
      expect(appTokenRepository.insert).toHaveBeenCalledWith({
        userId: TARGET_USER_ID,
        workspaceId: WORKSPACE_ID,
        type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
        value: hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
        expiresAt,
        context: { issuedByUserId: ACTOR.id },
      });
      expect(emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'target@example.com' }),
      );
      expect(
        JSON.stringify((renderEmail as jest.Mock).mock.calls[0][0].props),
      ).not.toContain(recoveryCode);
    });

    it('names the admin by email in the notification when they have no name', async () => {
      await service.generateRecoveryCode({
        actor: { ...ACTOR, firstName: '', lastName: '' },
        actorWorkspaceId: WORKSPACE_ID,
        otp: '123456',
        targetUserId: TARGET_USER_ID,
        targetWorkspaceId: WORKSPACE_ID,
      });

      expect(
        JSON.stringify((renderEmail as jest.Mock).mock.calls[0][0].props),
      ).toContain('admin@example.com');
    });

    it('refuses a target with server admin privileges the actor lacks', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(
        buildTargetUserWorkspace({ canAccessFullAdminPanel: true }),
      );

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(appTokenRepository.insert).not.toHaveBeenCalled();
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

      expect(appTokenRepository.insert).toHaveBeenCalled();
    });

    it('refuses a member with no authenticator to recover', async () => {
      methodRepository.exists.mockResolvedValue(false);

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
      expect(appTokenRepository.insert).not.toHaveBeenCalled();
    });

    it('issues a new code to a member who has not finished setting up the authenticator from a previous recovery', async () => {
      methodRepository.exists.mockResolvedValue(false);
      appTokenRepository.exists.mockResolvedValue(true);

      await generate();

      expect(appTokenRepository.insert).toHaveBeenCalled();
    });

    it('refuses a user who is not a member of the workspace', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

      await expect(generate()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
      });
    });

    it('reports a conflict when another code was issued for the member at the same time', async () => {
      appTokenRepository.insert.mockRejectedValue(
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
    const redeem = ({
      isTwoFactorAuthenticationEnforced = false,
    }: { isTwoFactorAuthenticationEnforced?: boolean } = {}) =>
      service.redeemRecoveryCode({
        userId: TARGET_USER_ID,
        userEmail: 'target@example.com',
        workspace: {
          id: WORKSPACE_ID,
          displayName: 'Apple',
          isTwoFactorAuthenticationEnforced,
        },
        recoveryCode: 'abcde-fghjk-mnpqr-stvwx',
      });

    const redeemableCodeWhere = {
      userId: TARGET_USER_ID,
      workspaceId: WORKSPACE_ID,
      type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
      value: hashTwoFactorAuthenticationRecoveryCode('ABCDEFGHJKMNPQRSTVWX'),
      deletedAt: IsNull(),
      revokedAt: IsNull(),
      createdAt: MoreThanOrEqual(MEMBERSHIP_CREATED_AT),
    };

    it('consumes the code, removes the authenticator and revokes refresh tokens together, then signs out the member', async () => {
      await expect(redeem()).resolves.toEqual({ provisioningUri: null });

      expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
        buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey({
          userWorkspaceId: TARGET_USER_WORKSPACE_ID,
        }),
        1,
        expect.any(Number),
        expect.any(Number),
      );
      expect(transactionalRepositories.appToken.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining(redeemableCodeWhere),
        { deletedAt: expect.any(Date), revokedAt: expect.any(Date) },
      );
      expect(transactionalRepositories.method.delete).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: TARGET_USER_WORKSPACE_ID,
      });
      expect(refreshTokenRevocationQueryBuilder.where).toHaveBeenCalledWith({
        userId: TARGET_USER_ID,
        workspaceId: WORKSPACE_ID,
        type: AppTokenType.RefreshToken,
        expiresAt: MoreThan(expect.any(Date)),
      });
      expect(refreshTokenRevocationQueryBuilder.set).toHaveBeenCalledWith({
        revokedAt: expect.any(Function),
        context: expect.any(Function),
      });
      expect(
        refreshTokenRevocationQueryBuilder.set.mock.calls[0][0].revokedAt(),
      ).toBe(`COALESCE("revokedAt", now())`);
      expect(
        refreshTokenRevocationQueryBuilder.set.mock.calls[0][0].context(),
      ).toContain(`COALESCE("context", '{}'::jsonb) ||`);
      expect(
        refreshTokenRevocationQueryBuilder.setParameters,
      ).toHaveBeenCalledWith({
        revokedReason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
      });
      expect(refreshTokenRevocationQueryBuilder.execute).toHaveBeenCalled();
      expect(transactionalRepositories.method.insert).not.toHaveBeenCalled();
      expect(userSessionService.revokeAllSessionsForUser).toHaveBeenCalledWith({
        userId: TARGET_USER_ID,
        workspaceId: WORKSPACE_ID,
        reason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
      });
      expect(
        transactionalRepositories.appToken.update.mock.invocationCallOrder[0],
      ).toBeLessThan(
        userSessionService.revokeAllSessionsForUser.mock.invocationCallOrder[0],
      );
      expect(emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'target@example.com' }),
      );
    });

    it('hands the replacement authenticator only to the redeeming request when the workspace enforces two-factor authentication', async () => {
      await expect(
        redeem({ isTwoFactorAuthenticationEnforced: true }),
      ).resolves.toEqual({ provisioningUri: REPLACEMENT_PROVISIONING_URI });

      expect(transactionalRepositories.appToken.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
        }),
        { deletedAt: expect.any(Date) },
      );
      expect(transactionalRepositories.method.insert).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: TARGET_USER_WORKSPACE_ID,
        secret: 'encrypted-replacement-secret',
        status: OTPStatus.PENDING,
        strategy: TwoFactorAuthenticationStrategy.TOTP,
      });
      expect(
        transactionalRepositories.method.delete.mock.invocationCallOrder[0],
      ).toBeLessThan(
        transactionalRepositories.method.insert.mock.invocationCallOrder[0],
      );
    });

    it('rejects an unknown, expired, used or revoked code without signing anyone out', async () => {
      transactionalRepositories.appToken.update.mockResolvedValueOnce({
        affected: 0,
      });

      await expect(redeem()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.INVALID_RECOVERY_CODE,
      });
      expect(
        userSessionService.revokeAllSessionsForUser,
      ).not.toHaveBeenCalled();
      expect(transactionalRepositories.method.delete).not.toHaveBeenCalled();
      expect(transactionalRepositories.appToken.update).toHaveBeenCalledTimes(
        1,
      );
      expect(emailService.send).not.toHaveBeenCalled();
    });
  });

  describe('assertEnrollmentNotReservedForRecoveryOrThrow', () => {
    const assertEnrollmentAllowed = () =>
      service.assertEnrollmentNotReservedForRecoveryOrThrow({
        userId: TARGET_USER_ID,
        workspaceId: WORKSPACE_ID,
      });

    it('refuses public enrollment until the authenticator issued by a recovery is verified, however long ago it was redeemed', async () => {
      methodRepository.exists.mockResolvedValue(false);
      appTokenRepository.exists.mockResolvedValue(true);

      await expect(assertEnrollmentAllowed()).rejects.toMatchObject({
        code: TwoFactorAuthenticationExceptionCode.RECOVERY_ENROLLMENT_RESTRICTED,
      });
      expect(appTokenRepository.exists).toHaveBeenCalledWith({
        where: {
          userId: TARGET_USER_ID,
          workspaceId: WORKSPACE_ID,
          type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
          deletedAt: Not(IsNull()),
          revokedAt: IsNull(),
          createdAt: MoreThanOrEqual(MEMBERSHIP_CREATED_AT),
        },
      });
    });

    it('allows enrollment when no redeemed recovery is waiting for its authenticator', async () => {
      methodRepository.exists.mockResolvedValue(false);
      appTokenRepository.exists.mockResolvedValue(false);

      await expect(assertEnrollmentAllowed()).resolves.toBeUndefined();
    });

    it('leaves non-members to the provisioning flow', async () => {
      userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

      await expect(assertEnrollmentAllowed()).resolves.toBeUndefined();
      expect(appTokenRepository.exists).not.toHaveBeenCalled();
    });
  });

  describe('revokeRecoveryCode', () => {
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
        twoFactorAuthenticationService.revokeRecoveryCodes,
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
      expect(appTokenRepository.findOne).not.toHaveBeenCalled();
    });
  });
});
