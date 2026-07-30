import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { ONBOARDING_INSTALLABLE_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/onboarding/constants/onboarding-installable-app-universal-identifiers';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { INSTALL_ONBOARDING_APPS_JOB_NAME } from 'src/engine/core-modules/onboarding/jobs/install-onboarding-apps.job-constants';
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

  const userId = 'user-id';
  const workspaceId = 'workspace-id';

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
            getAll: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOnboardingStatus', () => {
    const user = { id: userId } as UserEntity;

    const mockOnboardingState = ({
      pendingSteps,
      isPlanRequired,
    }: {
      pendingSteps: OnboardingStepKeys[];
      isPlanRequired: boolean;
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
    };

    it('should return BOOK_CALL when the step is pending and a plan is still required', async () => {
      mockOnboardingState({
        pendingSteps: [OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING],
        isPlanRequired: true,
      });

      expect(await service.getOnboardingStatus({ user, workspaceId })).toBe(
        OnboardingStatus.BOOK_CALL,
      );
    });

    // A late enrichment can arm the flag after checkout; honouring it then would drag
    // a paying user off the payment-success screen and back to the booking page.
    it('should ignore a pending BOOK_CALL once the workspace has a subscription', async () => {
      mockOnboardingState({
        pendingSteps: [OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING],
        isPlanRequired: false,
      });

      expect(await service.getOnboardingStatus({ user, workspaceId })).toBe(
        OnboardingStatus.COMPLETED,
      );
    });

    it('should keep INVITE_TEAM ahead of a pending BOOK_CALL', async () => {
      mockOnboardingState({
        pendingSteps: [
          OnboardingStepKeys.ONBOARDING_INVITE_TEAM_PENDING,
          OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
        ],
        isPlanRequired: true,
      });

      expect(await service.getOnboardingStatus({ user, workspaceId })).toBe(
        OnboardingStatus.INVITE_TEAM,
      );
    });

    it('should return PLAN_REQUIRED when no step is pending and a plan is required', async () => {
      mockOnboardingState({ pendingSteps: [], isPlanRequired: true });

      expect(await service.getOnboardingStatus({ user, workspaceId })).toBe(
        OnboardingStatus.PLAN_REQUIRED,
      );
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

      expect(userVarsService.delete).toHaveBeenCalledWith({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      });
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

      expect(userVarsService.delete).toHaveBeenCalledWith({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      });
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
      });

      expect(userVarsService.delete).toHaveBeenCalledWith({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_INSTALL_APPS_PENDING,
      });
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
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should claim the step but not enqueue when no installable app was selected', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);

      await service.triggerInstallAppsOnboardingStep({
        userId,
        workspaceId,
        universalIdentifiers: ['00000000-0000-0000-0000-000000000000'],
      });

      expect(userVarsService.delete).toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
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

    it('should not re-flag the step once it has already been evaluated', async () => {
      mockConfig({
        calendarBookingPageId: 'team/twenty/talk-to-us',
        minEmployeeCount: 50,
      });
      jest.spyOn(userVarsService, 'get').mockResolvedValue(false);

      await service.setOnboardingBookCallPendingIfQualified({
        userId,
        workspaceId,
        employeeCount: 320,
      });

      expect(userVarsService.set).not.toHaveBeenCalled();
    });

    it('should keep a false record when the step is completed so it cannot reopen', async () => {
      await service.setOnboardingBookCallPending({
        userId,
        workspaceId,
        value: false,
      });

      expect(userVarsService.set).toHaveBeenCalledWith(
        {
          userId,
          workspaceId,
          key: OnboardingStepKeys.ONBOARDING_BOOK_CALL_PENDING,
          value: false,
        },
        undefined,
      );
      expect(userVarsService.delete).not.toHaveBeenCalled();
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
          undefined,
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
});
