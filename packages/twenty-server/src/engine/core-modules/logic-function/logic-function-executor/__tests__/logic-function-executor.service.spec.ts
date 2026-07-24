import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('LogicFunctionExecutorService - billing', () => {
  let service: LogicFunctionExecutorService;
  let coreEntityCacheService: { get: jest.Mock };
  let billingUsageService: { decrementAvailableCreditsInCache: jest.Mock };
  let workspaceEventEmitter: { emitCustomBatchEvent: jest.Mock };

  const flatApplication = {
    id: 'application-id',
    applicationRegistrationId: 'registration-id',
  };
  const flatLogicFunction = { id: 'logic-function-id', name: 'my-function' };
  const workspaceId = 'workspace-id';
  const result = { logs: '', duration: 5, status: 'SUCCESS' };

  const invokeHandleExecutionResult = () =>
    (
      service as unknown as {
        handleExecutionResult: (args: unknown) => Promise<void>;
      }
    ).handleExecutionResult({
      result,
      flatApplication,
      flatLogicFunction,
      workspaceId,
    });

  beforeEach(async () => {
    coreEntityCacheService = { get: jest.fn() };
    billingUsageService = { decrementAvailableCreditsInCache: jest.fn() };
    workspaceEventEmitter = { emitCustomBatchEvent: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionExecutorService,
        { provide: LogicFunctionDriverFactory, useValue: {} },
        { provide: ThrottlerService, useValue: {} },
        { provide: TwentyConfigService, useValue: {} },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              currentBillingSubscription: {
                currentPeriodStart: new Date('2024-01-01T00:00:00.000Z'),
              },
            }),
          },
        },
        { provide: CoreEntityCacheService, useValue: coreEntityCacheService },
        { provide: ApplicationTokenService, useValue: {} },
        { provide: SecretEncryptionService, useValue: {} },
        { provide: SubscriptionService, useValue: {} },
        { provide: EventLogLiveService, useValue: {} },
        {
          provide: EventLogEmitterService,
          useValue: {
            isEnabled: jest.fn().mockReturnValue(false),
            createContext: jest
              .fn()
              .mockReturnValue({ insertWorkspaceEvent: jest.fn() }),
          },
        },
        { provide: WorkspaceEventEmitter, useValue: workspaceEventEmitter },
        {
          provide: BillingService,
          useValue: { isBillingEnabled: jest.fn().mockReturnValue(true) },
        },
        { provide: BillingUsageService, useValue: billingUsageService },
        { provide: FeatureFlagService, useValue: {} },
        { provide: WorkspaceDomainsService, useValue: {} },
        { provide: ApplicationService, useValue: {} },
        { provide: ApplicationStopService, useValue: {} },
        { provide: getRepositoryToken(WorkspaceEntity), useValue: {} },
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(LogicFunctionExecutorService);
    // The CLI log publisher is unrelated to billing and reaches out to other
    // services; stub it so the test focuses on the billing branch.
    (
      service as unknown as { publishLogicFunctionLogsToCli: jest.Mock }
    ).publishLogicFunctionLogsToCli = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should charge 100 micro-credits for a non-exempt app', async () => {
    coreEntityCacheService.get.mockResolvedValue(false);

    await invokeHandleExecutionResult();

    expect(
      billingUsageService.decrementAvailableCreditsInCache,
    ).toHaveBeenCalledWith({ workspaceId, usedCredits: 100 });
    expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
      USAGE_RECORDED,
      [expect.objectContaining({ creditsUsedMicro: 100, quantity: 1 })],
      workspaceId,
    );
  });

  it('should not charge credits for a billing-exempt app', async () => {
    coreEntityCacheService.get.mockResolvedValue(true);

    await invokeHandleExecutionResult();

    expect(
      billingUsageService.decrementAvailableCreditsInCache,
    ).not.toHaveBeenCalled();
    expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
      USAGE_RECORDED,
      [expect.objectContaining({ creditsUsedMicro: 0, quantity: 1 })],
      workspaceId,
    );
  });

  it('should charge credits when the exemption lookup fails', async () => {
    coreEntityCacheService.get.mockRejectedValue(new Error('cache down'));

    await invokeHandleExecutionResult();

    expect(
      billingUsageService.decrementAvailableCreditsInCache,
    ).toHaveBeenCalledWith({ workspaceId, usedCredits: 100 });
  });
});
