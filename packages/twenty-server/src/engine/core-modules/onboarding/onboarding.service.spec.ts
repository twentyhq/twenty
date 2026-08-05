import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  type DataSource,
  type EntityManager,
  type QueryRunner,
  Repository,
} from 'typeorm';

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
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let userVarsService: UserVarsService;
  let billingService: BillingService;
  let billingCreditService: BillingCreditService;
  let twentyConfigService: TwentyConfigService;
  let messageQueueService: MessageQueueService;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let dataSource: DataSource;

  const userId = 'user-id';
  const workspaceId = 'workspace-id';
  let mockQueryRunner: QueryRunner;
  let transactionQueryRunner: QueryRunner | undefined;

  beforeEach(async () => {
    mockQueryRunner = { query: jest.fn() } as unknown as QueryRunner;
    transactionQueryRunner = mockQueryRunner;

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
            setIfNotExists: jest.fn().mockResolvedValue(true),
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
                  queryRunner: transactionQueryRunner,
                } as EntityManager),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    userVarsService = module.get<UserVarsService>(UserVarsService);
    billingService = module.get<BillingService>(BillingService);
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    billingCreditService =
      module.get<BillingCreditService>(BillingCreditService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.workspaceQueue),
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOnboardingStatus', () => {
    const user = { id: userId } as UserEntity;

    const mockOnboardingState = ({
      pendingSteps,
      isPlanRequired,
      isBookCallStepConfigured = true,
    }: {
      pendingSteps: OnboardingStepKeys[];
      isPlanRequired: boolean;
      isBookCallStepConfigured?: boolean;
    }) => {
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue({
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      } as WorkspaceEntity);
      jest
        .spyOn(userVarsService, 'getAll')
        .mockResolvedValue(
          new Map(pendingSteps.map((key) => [key, true])) as never,
        );
      jest
        .spyOn(billingService, 'isSubscriptionIncompleteOnboardingStatus')
        .mockResolvedValue(isPlanRequired);
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (!isBookCallStepConfigured) {
            return undefined as never;
          }

          return (
            key === 'CALENDAR_BOOKING_PAGE_ID' ? 'team/twenty/talk-to-us' : 50
          ) as never;
        });
    };

    it('should return BOOK_CALL when the step is pending and a plan is still required', async () => {
      mockOnboardingState({
        pendingSteps: [OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING],
        isPlanRequired: true,
      });

      expect(
        await service.getOnboardingStatus({ userId: user.id, workspaceId }),
      ).toBe(OnboardingStatus.BOOK_CALL);
    });

    it('should ignore a pending BOOK_CALL once the workspace has a subscription', async () => {
      mockOnboardingState({
        pendingSteps: [OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING],
        isPlanRequired: false,
      });

      expect(
        await service.getOnboardingStatus({ userId: user.id, workspaceId }),
      ).toBe(OnboardingStatus.COMPLETED);
    });

    it('should ignore a pending BOOK_CALL once the booking page is unconfigured', async () => {
      mockOnboardingState({
        pendingSteps: [OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING],
        isPlanRequired: true,
        isBookCallStepConfigured: false,
      });

      expect(
        await service.getOnboardingStatus({ userId: user.id, workspaceId }),
      ).toBe(OnboardingStatus.PLAN_REQUIRED);
    });

    it('should keep INVITE_TEAM ahead of a pending BOOK_CALL', async () => {
      mockOnboardingState({
        pendingSteps: [
          OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
          OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
        ],
        isPlanRequired: true,
      });

      expect(
        await service.getOnboardingStatus({ userId: user.id, workspaceId }),
      ).toBe(OnboardingStatus.INVITE_TEAM);
    });

    it('should return PLAN_REQUIRED when no step is pending and a plan is required', async () => {
      mockOnboardingState({ pendingSteps: [], isPlanRequired: true });

      expect(
        await service.getOnboardingStatus({ userId: user.id, workspaceId }),
      ).toBe(OnboardingStatus.PLAN_REQUIRED);
    });
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

  describe('setOnboardingBookCallPendingIfQualified', () => {
    const mockConfig = ({
      calendarBookingPageId,
      minEmployeeCount,
    }: {
      calendarBookingPageId?: string;
      minEmployeeCount?: number;
    }) => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) =>
          key === 'CALENDAR_BOOKING_PAGE_ID'
            ? calendarBookingPageId
            : minEmployeeCount,
        );
    };

    it('should not offer the step twice', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest.spyOn(userVarsService, 'setIfNotExists').mockResolvedValue(false);

      const isPending = await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 320,
      });

      expect(isPending).toBe(false);
      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should record the offer so a later enrichment cannot reopen the step', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });

      const isPending = await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 320,
      });

      expect(isPending).toBe(true);
      expect(userVarsService.setIfNotExists).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_OFFERED,
          value: true,
        },
        mockQueryRunner,
      );
    });

    it('should let only one of two concurrent qualifications flag the step', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest
        .spyOn(userVarsService, 'setIfNotExists')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await Promise.all([
        service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: 320,
        }),
        service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: 320,
        }),
      ]);

      expect(userVarsService.set).toHaveBeenCalledTimes(1);
    });

    it('should write the offer and the pending step in a single transaction', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 320,
      });

      const [[, offeredQueryRunner]] = jest.mocked(
        userVarsService.setIfNotExists,
      ).mock.calls;
      const [[, pendingQueryRunner]] = jest.mocked(userVarsService.set).mock
        .calls;

      expect(offeredQueryRunner).toBe(mockQueryRunner);
      expect(pendingQueryRunner).toBe(mockQueryRunner);
    });

    it('should not record the offer when flagging the step fails', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest
        .spyOn(dataSource, 'transaction')
        .mockRejectedValue(new Error('user vars down'));

      await expect(
        service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: 320,
        }),
      ).resolves.not.toThrow();

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should offer the step again after a failed attempt left nothing behind', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest
        .spyOn(dataSource, 'transaction')
        .mockRejectedValueOnce(new Error('user vars down'));

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 320,
      });
      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 320,
      });

      expect(userVarsService.setIfNotExists).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_OFFERED,
          value: true,
        },
        mockQueryRunner,
      );
    });

    it('should not throw when the user vars are unavailable', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest
        .spyOn(userVarsService, 'setIfNotExists')
        .mockRejectedValue(new Error('user vars down'));

      await expect(
        service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: 320,
        }),
      ).resolves.toBe(false);
    });

    it('should not flag the step when the transaction exposes no query runner', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      transactionQueryRunner = undefined;

      await expect(
        service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: 320,
        }),
      ).resolves.toBe(false);

      expect(userVarsService.setIfNotExists).not.toHaveBeenCalled();
    });

    it('should clear the pending var when the step is completed', async () => {
      await service.setOnboardingBookCallPending({
        userId,
        workspaceId,
        value: false,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
        },
        undefined,
      );
      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it.each([50, 51])(
      'should flag the step when the employee count is %s',
      async (employeeCount) => {
        mockConfig({
          calendarBookingPageId: 'team/twenty/talk-to-us',
          minEmployeeCount: 50,
        });

        await service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount,
        });

        expect(userVarsService.set).toHaveBeenCalledWith(
          {
            userId,
            workspaceId,
            key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
            value: true,
          },
          mockQueryRunner,
        );
      },
    );

    it('should not flag the step below the threshold', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 49,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not flag the step without an employee count', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: null,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not flag the step when no threshold is configured', async () => {
      mockConfig({ calendarBookingPageId: 'team/twenty/talk-to-us' });

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 5000,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should treat a zero threshold as unconfigured', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 0,
      });

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 5000,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should not flag the step when no booking page is configured', async () => {
      mockConfig({ minEmployeeCount: 50 });

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 5000,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });
  });

  describe('isOnboardingBookCallPending', () => {
    const mockConfig = ({
      calendarBookingPageId,
      minEmployeeCount,
    }: {
      calendarBookingPageId?: string;
      minEmployeeCount?: number;
    }) => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) =>
          key === 'CALENDAR_BOOKING_PAGE_ID'
            ? calendarBookingPageId
            : minEmployeeCount,
        );
    };

    it('should report the stored pending var', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest.spyOn(userVarsService, 'get').mockResolvedValue(true);

      expect(
        await service.isOnboardingBookCallPending({ userId, workspaceId }),
      ).toBe(true);
      expect(userVarsService.get).toHaveBeenCalledWith({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
      });
    });

    it('should report false without reading the var when the step is unconfigured', async () => {
      mockConfig({ minEmployeeCount: 50 });

      expect(
        await service.isOnboardingBookCallPending({ userId, workspaceId }),
      ).toBe(false);
      expect(userVarsService.get).not.toHaveBeenCalled();
    });
  });
});
