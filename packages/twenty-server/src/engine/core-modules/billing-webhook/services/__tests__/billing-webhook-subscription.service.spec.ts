/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import type Stripe from 'stripe';

import { mockStripeSubscriptionUpdatedEventWithoutUpdatedItem } from 'src/engine/core-modules/billing-webhook/__mocks__/stripe-subscription-updated-events';
import { BillingWebhookSubscriptionService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription.service';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';

const buildWorkspace = (activationStatus: WorkspaceActivationStatus) =>
  ({
    id: WORKSPACE_ID,
    activationStatus,
    deletedAt: null,
  }) as unknown as WorkspaceEntity;

const buildSubscriptionUpdatedEvent = (
  overrides: Partial<Stripe.Subscription>,
): Stripe.CustomerSubscriptionUpdatedEvent => {
  const baseEvent = mockStripeSubscriptionUpdatedEventWithoutUpdatedItem;

  return {
    ...baseEvent,
    data: {
      ...baseEvent.data,
      object: {
        ...baseEvent.data.object,
        ...overrides,
      },
    },
  };
};

const buildLiveSubscription = (
  overrides: Partial<Stripe.Subscription>,
): SubscriptionWithSchedule =>
  ({
    ...mockStripeSubscriptionUpdatedEventWithoutUpdatedItem.data.object,
    ...overrides,
  }) as unknown as SubscriptionWithSchedule;

describe('BillingWebhookSubscriptionService', () => {
  let service: BillingWebhookSubscriptionService;
  let workspaceRepository: { findOne: jest.Mock };
  let workspaceService: {
    suspendWorkspace: jest.Mock;
    reactivateWorkspace: jest.Mock;
    deleteWorkspace: jest.Mock;
  };
  let stripeSubscriptionScheduleService: {
    getSubscriptionWithSchedule: jest.Mock;
  };
  let messageQueueService: { add: jest.Mock };

  beforeEach(async () => {
    workspaceRepository = { findOne: jest.fn() };
    workspaceService = {
      suspendWorkspace: jest.fn(),
      reactivateWorkspace: jest.fn(),
      deleteWorkspace: jest.fn(),
    };
    stripeSubscriptionScheduleService = {
      getSubscriptionWithSchedule: jest.fn(),
    };
    messageQueueService = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingWebhookSubscriptionService,
        {
          provide: StripeCustomerService,
          useValue: { updateCustomerMetadataWorkspaceId: jest.fn() },
        },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: messageQueueService,
        },
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: {
            upsert: jest.fn(),
            find: jest.fn().mockResolvedValue([
              {
                id: 'billing-subscription-id',
                stripeSubscriptionId:
                  mockStripeSubscriptionUpdatedEventWithoutUpdatedItem.data
                    .object.id,
              },
            ]),
          },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: { upsert: jest.fn(), delete: jest.fn() },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: { upsert: jest.fn() },
        },
        { provide: WorkspaceService, useValue: workspaceService },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: stripeSubscriptionScheduleService,
        },
        {
          provide: BillingUsageCacheService,
          useValue: { flushAvailableCredits: jest.fn() },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BillingWebhookSubscriptionService>(
      BillingWebhookSubscriptionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processStripeEvent', () => {
    it('should not suspend and should reactivate when a stale past_due event is processed after the subscription became active', async () => {
      // Trial ended one hour ago: a past_due payload within the 24h window
      // previously triggered a suspension even if the customer had already paid
      const trialEndOneHourAgo = Math.floor(Date.now() / 1000) - 3600;

      const staleEvent = buildSubscriptionUpdatedEvent({
        status: 'past_due',
        trial_end: trialEndOneHourAgo,
      });

      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({
          status: 'active',
          trial_end: trialEndOneHourAgo,
        }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
      );

      await service.processStripeEvent(WORKSPACE_ID, staleEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.reactivateWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(messageQueueService.add).toHaveBeenCalled();
    });

    it('should suspend an active workspace when the live subscription is unpaid even if the event payload says active', async () => {
      const staleEvent = buildSubscriptionUpdatedEvent({ status: 'active' });

      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'unpaid' }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.ACTIVE),
      );

      await service.processStripeEvent(WORKSPACE_ID, staleEvent);

      expect(workspaceService.suspendWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(workspaceService.reactivateWorkspace).not.toHaveBeenCalled();
    });

    it('should reactivate based on the freshly read workspace status when a concurrent handler suspended it mid-processing', async () => {
      const activeEvent = buildSubscriptionUpdatedEvent({ status: 'active' });

      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'active' }),
      );

      // First read (start of handler) sees ACTIVE; a concurrent event suspends
      // the workspace before the decision, so the re-read returns SUSPENDED
      workspaceRepository.findOne
        .mockResolvedValueOnce(buildWorkspace(WorkspaceActivationStatus.ACTIVE))
        .mockResolvedValueOnce(
          buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
        );

      await service.processStripeEvent(WORKSPACE_ID, activeEvent);

      expect(workspaceService.reactivateWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
    });

    it('should not reactivate a suspended workspace when the live subscription is past_due outside the trial window', async () => {
      const staleEvent = buildSubscriptionUpdatedEvent({ status: 'active' });

      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'past_due', trial_end: null }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
      );

      await service.processStripeEvent(WORKSPACE_ID, staleEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.reactivateWorkspace).not.toHaveBeenCalled();
    });
  });
});
