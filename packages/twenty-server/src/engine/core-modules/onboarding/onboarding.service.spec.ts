import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type EntityManager, type QueryRunner, Repository } from 'typeorm';

import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { ONBOARDING_INSTALLABLE_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/onboarding/constants/onboarding-installable-app-universal-identifiers';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { INSTALL_ONBOARDING_APPS_JOB_NAME } from 'src/engine/core-modules/onboarding/jobs/install-onboarding-apps.job-constants';
import { OnboardingException } from 'src/engine/core-modules/onboarding/onboarding.exception';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let userVarsService: UserVarsService;
  let billingCreditService: BillingCreditService;
  let twentyConfigService: TwentyConfigService;
  let messageQueueService: MessageQueueService;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;

  const userId = 'user-id';
  const workspaceId = 'workspace-id';
  const mockQueryRunner = { query: jest.fn() } as unknown as QueryRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: BillingService,
          useValue: {
            isSubscriptionIncompleteOnboardingStatus: jest.fn(),
          },
        },
        {
          provide: BillingCreditService,
          useValue: {
            creditWorkspaceBalance: jest.fn(),
          },
        },
        {
          provide: UserVarsService,
          useValue: {
            get: jest.fn(),
            getAll: jest.fn().mockResolvedValue(new Map()),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            countBy: jest.fn(),
          },
        },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: jest.fn(
              async (
                runInTransaction: (
                  entityManager: EntityManager,
                ) => Promise<unknown>,
              ) =>
                runInTransaction({
                  queryRunner: mockQueryRunner,
                } as EntityManager),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    userVarsService = module.get<UserVarsService>(UserVarsService);
    billingCreditService =
      module.get<BillingCreditService>(BillingCreditService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.workspaceQueue),
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('completeOnboardingConnectAccountStep', () => {
    it('should credit the import-contacts reward when the step was claimed by the first workspace user', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest.spyOn(userWorkspaceRepository, 'countBy').mockResolvedValue(1);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);

      await service.completeOnboardingConnectAccountStep({
        userId,
        workspaceId,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
        },
        undefined,
      );
      expect(billingCreditService.creditWorkspaceBalance).toHaveBeenCalledWith({
        workspaceId,
        amountMicro: 2_000_000,
      });
    });

    it('should claim the step but not credit when the workspace has more than one member', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest.spyOn(userWorkspaceRepository, 'countBy').mockResolvedValue(2);

      await service.completeOnboardingConnectAccountStep({
        userId,
        workspaceId,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
        },
        undefined,
      );
      expect(
        billingCreditService.creditWorkspaceBalance,
      ).not.toHaveBeenCalled();
    });

    it('should not credit anything when the step was already consumed', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(0);

      await service.completeOnboardingConnectAccountStep({
        userId,
        workspaceId,
      });

      expect(
        billingCreditService.creditWorkspaceBalance,
      ).not.toHaveBeenCalled();
    });

    it('should credit only once when two completions race for the same step', async () => {
      jest
        .spyOn(userVarsService, 'delete')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);
      jest.spyOn(userWorkspaceRepository, 'countBy').mockResolvedValue(1);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);

      await Promise.all([
        service.completeOnboardingConnectAccountStep({ userId, workspaceId }),
        service.completeOnboardingConnectAccountStep({ userId, workspaceId }),
      ]);

      expect(billingCreditService.creditWorkspaceBalance).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should not throw when crediting fails', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest.spyOn(userWorkspaceRepository, 'countBy').mockResolvedValue(1);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);
      jest
        .spyOn(billingCreditService, 'creditWorkspaceBalance')
        .mockRejectedValue(new Error('billing failure'));

      await expect(
        service.completeOnboardingConnectAccountStep({
          userId,
          workspaceId,
        }),
      ).resolves.not.toThrow();
    });

    it('should not throw when the workspace member count is unavailable', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest
        .spyOn(userWorkspaceRepository, 'countBy')
        .mockRejectedValue(new Error('database failure'));

      await expect(
        service.completeOnboardingConnectAccountStep({
          userId,
          workspaceId,
        }),
      ).resolves.not.toThrow();

      expect(
        billingCreditService.creditWorkspaceBalance,
      ).not.toHaveBeenCalled();
    });
  });

  describe('triggerInstallAppsOnboardingStep', () => {
    const [callRecorderId, peopleDataLabsId] =
      ONBOARDING_INSTALLABLE_APP_UNIVERSAL_IDENTIFIERS;

    it('should claim the step and enqueue the install job for the installable apps without crediting', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: [callRecorderId, peopleDataLabsId],
        isAutoSkipped: false,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_INSTALL_APPS_PENDING,
        },
        undefined,
      );
      expect(messageQueueService.add).toHaveBeenCalledWith(
        INSTALL_ONBOARDING_APPS_JOB_NAME,
        {
          workspaceId,
          universalIdentifiers: [callRecorderId, peopleDataLabsId],
        },
        { id: `${INSTALL_ONBOARDING_APPS_JOB_NAME}-${workspaceId}` },
      );
      expect(
        billingCreditService.creditWorkspaceBalance,
      ).not.toHaveBeenCalled();
    });

    it('should not enqueue anything when the step was already consumed', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(0);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: [callRecorderId],
        isAutoSkipped: false,
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should claim the step but not enqueue when no installable app was selected', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: ['00000000-0000-0000-0000-000000000000'],
        isAutoSkipped: false,
      });

      expect(userVarsService.delete).toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should record the step as reversible when the user skipped it', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: [],
        isAutoSkipped: false,
      });

      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
          value: [OnboardingStatus.APPS_INSTALLATION],
        },
        mockQueryRunner,
      );
    });

    it('should not record the step as reversible when it was auto-skipped', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: [],
        isAutoSkipped: true,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not record the step as reversible when apps were actually installed', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: [callRecorderId],
        isAutoSkipped: false,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });
  });

  describe('skipOnboardingConnectAccountStep', () => {
    it('should record the step as reversible when the user skipped it', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.skipOnboardingConnectAccountStep({
        userId,
        workspaceId,
        isAutoSkipped: false,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
        },
        mockQueryRunner,
      );
      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
          value: [OnboardingStatus.SYNC_EMAIL],
        },
        mockQueryRunner,
      );
    });

    it('should not record the step as reversible when it was auto-skipped', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.skipOnboardingConnectAccountStep({
        userId,
        workspaceId,
        isAutoSkipped: true,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not record the step as reversible when it was already consumed', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(0);

      await service.skipOnboardingConnectAccountStep({
        userId,
        workspaceId,
        isAutoSkipped: false,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not record the step as reversible when it granted the import-contacts reward', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest.spyOn(userWorkspaceRepository, 'countBy').mockResolvedValue(1);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);

      await service.completeOnboardingConnectAccountStep({
        userId,
        workspaceId,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });
  });

  describe('completeOnboardingProfileStepIfNameProvided', () => {
    it('should record the step as reversible when a name was provided', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.completeOnboardingProfileStepIfNameProvided({
        userId,
        workspaceId,
        firstName: 'Ada',
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING,
        },
        mockQueryRunner,
      );
      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
          value: [OnboardingStatus.PROFILE_CREATION],
        },
        mockQueryRunner,
      );
    });

    it('should not record anything when the step was not pending', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(0);

      await service.completeOnboardingProfileStepIfNameProvided({
        userId,
        workspaceId,
        firstName: 'Ada',
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not touch the step when no name part was provided', async () => {
      await service.completeOnboardingProfileStepIfNameProvided({
        userId,
        workspaceId,
        firstName: '',
        lastName: '',
      });

      expect(userVarsService.delete).not.toHaveBeenCalled();
      expect(userVarsService.set).not.toHaveBeenCalled();
    });
  });

  describe('completeOnboardingInviteTeamStep', () => {
    it('should record the step as reversible when no invitation was sent', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.completeOnboardingInviteTeamStep({
        userId,
        workspaceId,
        hasSentInvitations: false,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
        },
        mockQueryRunner,
      );
      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
          value: [OnboardingStatus.INVITE_TEAM],
        },
        mockQueryRunner,
      );
    });

    it('should not record the step as reversible when invitations were sent', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.completeOnboardingInviteTeamStep({
        userId,
        workspaceId,
        hasSentInvitations: true,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not record the step as reversible when the step was not pending', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(0);

      await service.completeOnboardingInviteTeamStep({
        userId,
        workspaceId,
        hasSentInvitations: false,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });
  });

  describe('getPreviousReversibleOnboardingStatus', () => {
    it('should return the last recorded step', async () => {
      jest
        .spyOn(userVarsService, 'get')
        .mockResolvedValue([
          OnboardingStatus.SYNC_EMAIL,
          OnboardingStatus.APPS_INSTALLATION,
        ]);

      await expect(
        service.getPreviousReversibleOnboardingStatus({ userId, workspaceId }),
      ).resolves.toBe(OnboardingStatus.APPS_INSTALLATION);
    });

    it('should return null when no step was recorded', async () => {
      jest.spyOn(userVarsService, 'get').mockResolvedValue(undefined);

      await expect(
        service.getPreviousReversibleOnboardingStatus({ userId, workspaceId }),
      ).resolves.toBeNull();
    });
  });

  describe('goBackToPreviousOnboardingStep', () => {
    beforeEach(() => {
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue({
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      } as WorkspaceEntity);
    });

    it('should pop the last step, re-arm its pending flag and return the resulting statuses', async () => {
      jest
        .spyOn(userVarsService, 'get')
        .mockResolvedValueOnce([
          OnboardingStatus.SYNC_EMAIL,
          OnboardingStatus.APPS_INSTALLATION,
        ])
        .mockResolvedValue([OnboardingStatus.SYNC_EMAIL]);
      jest
        .spyOn(userVarsService, 'getAll')
        .mockResolvedValue(
          new Map<string, boolean>([
            [OnboardingStepKeys.ONBOARDING_INSTALL_APPS_PENDING, true],
          ]),
        );

      const result = await service.goBackToPreviousOnboardingStep({
        userId,
        workspaceId,
      });

      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_REVERSIBLE_STEP_HISTORY,
          value: [OnboardingStatus.SYNC_EMAIL],
        },
        mockQueryRunner,
      );
      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_INSTALL_APPS_PENDING,
          value: true,
        },
        mockQueryRunner,
      );
      expect(result.onboardingStatus).toBe(OnboardingStatus.APPS_INSTALLATION);
      expect(result.previousOnboardingStatus).toBe(OnboardingStatus.SYNC_EMAIL);
    });

    it('should take the step transition lock before reading the history', async () => {
      const callOrder: string[] = [];

      jest
        .spyOn(mockQueryRunner, 'query')
        .mockImplementation(async (statement: string) => {
          callOrder.push(`query:${statement}`);

          return [];
        });
      jest.spyOn(userVarsService, 'get').mockImplementation(async () => {
        callOrder.push('readHistory');

        return [OnboardingStatus.SYNC_EMAIL];
      });
      jest
        .spyOn(userVarsService, 'getAll')
        .mockResolvedValue(
          new Map<string, boolean>([
            [OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING, true],
          ]),
        );

      await service.goBackToPreviousOnboardingStep({ userId, workspaceId });

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`onboarding-step-transition:${userId}:${workspaceId}`],
      );
      expect(callOrder[0]).toBe(
        'query:SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      );
      expect(callOrder[1]).toBe('readHistory');
    });

    it('should re-arm the workspace-scoped flag when going back to invite team', async () => {
      jest
        .spyOn(userVarsService, 'get')
        .mockResolvedValueOnce([OnboardingStatus.INVITE_TEAM])
        .mockResolvedValue([]);
      jest
        .spyOn(userVarsService, 'getAll')
        .mockResolvedValue(
          new Map<string, boolean>([
            [OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING, true],
          ]),
        );

      const result = await service.goBackToPreviousOnboardingStep({
        userId,
        workspaceId,
      });

      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
          value: true,
        },
        mockQueryRunner,
      );
      expect(result.onboardingStatus).toBe(OnboardingStatus.INVITE_TEAM);
      expect(result.previousOnboardingStatus).toBeNull();
    });

    it('should throw when there is no recorded step to go back to', async () => {
      jest.spyOn(userVarsService, 'get').mockResolvedValue([]);

      await expect(
        service.goBackToPreviousOnboardingStep({ userId, workspaceId }),
      ).rejects.toThrow(OnboardingException);
      expect(userVarsService.set).not.toHaveBeenCalled();
    });
  });

  describe('creditInstallAppsReward', () => {
    it('should credit the reward per installed app', async () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(1_000_000);

      await service.creditInstallAppsReward({
        workspaceId,
        rewardAppsCount: 2,
      });

      expect(billingCreditService.creditWorkspaceBalance).toHaveBeenCalledWith({
        workspaceId,
        amountMicro: 2_000_000,
      });
    });

    it('should not throw when crediting fails', async () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(1_000_000);
      jest
        .spyOn(billingCreditService, 'creditWorkspaceBalance')
        .mockRejectedValue(new Error('billing failure'));

      await expect(
        service.creditInstallAppsReward({
          workspaceId,
          rewardAppsCount: 1,
        }),
      ).resolves.not.toThrow();
    });
  });
});
