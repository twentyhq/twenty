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

const buildWorkspace = (
  activationStatus: WorkspaceActivationStatus,
  deletedAt: Date | null = null,
) =>
  ({
    id: WORKSPACE_ID,
    activationStatus,
    deletedAt,
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
    listCustomerNotEndedSubscriptionsWithSchedule: jest.Mock;
    getSubscriptionWithSchedule: jest.Mock;
  };
  let messageQueueService: { add: jest.Mock };
  let billingSubscriptionRepository: { upsert: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    workspaceRepository = { findOne: jest.fn() };
    workspaceService = {
      suspendWorkspace: jest.fn().mockResolvedValue(true),
      reactivateWorkspace: jest.fn().mockResolvedValue(true),
      deleteWorkspace: jest.fn(),
    };
    stripeSubscriptionScheduleService = {
      listCustomerNotEndedSubscriptionsWithSchedule: jest.fn(),
      getSubscriptionWithSchedule: jest.fn(),
    };
    messageQueueService = { add: jest.fn() };
    billingSubscriptionRepository = {
      upsert: jest.fn(),
      findOne: jest.fn().mockResolvedValue({
        id: 'billing-subscription-id',
        stripeSubscriptionId:
          mockStripeSubscriptionUpdatedEventWithoutUpdatedItem.data.object.id,
      }),
    };

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
          useValue: billingSubscriptionRepository,
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

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [
          buildLiveSubscription({
            status: 'active',
            trial_end: trialEndOneHourAgo,
          }),
        ],
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

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [buildLiveSubscription({ status: 'unpaid' })],
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

    it('should attempt the guarded reactivation even when the workspace snapshot is stale', async () => {
      const activeEvent = buildSubscriptionUpdatedEvent({ status: 'active' });

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [buildLiveSubscription({ status: 'active' })],
      );

      // The handler's snapshot says ACTIVE (e.g. a concurrent event suspends
      // the workspace mid-processing): reactivation is still attempted and the
      // compare-and-swap in WorkspaceService decides whether it applies
      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.ACTIVE),
      );

      await service.processStripeEvent(WORKSPACE_ID, activeEvent);

      expect(workspaceService.reactivateWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
    });

    it('should not suspend when the event subscription is canceled but the customer has another live activating subscription', async () => {
      const staleDeletionEvent = buildSubscriptionUpdatedEvent({
        status: 'canceled',
      });

      // The canceled event subscription is not in the not-canceled list and
      // is fetched through the direct retrieve fallback instead
      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [
          buildLiveSubscription({
            id: 'sub_new_active_subscription',
            status: 'active',
          }),
        ],
      );
      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'canceled' }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.ACTIVE),
      );

      await service.processStripeEvent(WORKSPACE_ID, staleDeletionEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
    });

    it('should neither suspend nor reactivate when a sibling subscription is in a past_due grace period', async () => {
      const deletionEvent = buildSubscriptionUpdatedEvent({
        status: 'canceled',
      });

      // The sibling is past_due outside the trial window: not suspend-worthy
      // (payment retries are in progress) but not activating either, so the
      // workspace must be left untouched
      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [
          buildLiveSubscription({
            id: 'sub_sibling_in_grace_period',
            status: 'past_due',
            trial_end: null,
          }),
        ],
      );
      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'canceled' }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.ACTIVE),
      );

      await service.processStripeEvent(WORKSPACE_ID, deletionEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.reactivateWorkspace).not.toHaveBeenCalled();
    });

    it('should reactivate a suspended workspace on a canceled subscription event when another live activating subscription exists', async () => {
      const staleDeletionEvent = buildSubscriptionUpdatedEvent({
        status: 'canceled',
      });

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [
          buildLiveSubscription({
            id: 'sub_new_trialing_subscription',
            status: 'trialing',
          }),
        ],
      );
      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'canceled' }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
      );

      await service.processStripeEvent(WORKSPACE_ID, staleDeletionEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.reactivateWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
    });

    it('should not enqueue the deletion warning cleanup job when the guarded reactivation did not apply', async () => {
      const activeEvent = buildSubscriptionUpdatedEvent({ status: 'active' });

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [buildLiveSubscription({ status: 'active' })],
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
      );

      // Compare-and-swap in WorkspaceService reports no transition, e.g. a
      // concurrent handler already reactivated the workspace
      workspaceService.reactivateWorkspace.mockResolvedValue(false);

      await service.processStripeEvent(WORKSPACE_ID, activeEvent);

      expect(workspaceService.reactivateWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should not reactivate a suspended workspace when the live subscription is past_due outside the trial window', async () => {
      const staleEvent = buildSubscriptionUpdatedEvent({ status: 'active' });

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [buildLiveSubscription({ status: 'past_due', trial_end: null })],
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
      );

      await service.processStripeEvent(WORKSPACE_ID, staleEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.reactivateWorkspace).not.toHaveBeenCalled();
    });

    it('should fall back to a direct subscription retrieve when the customer subscription list does not contain the event subscription', async () => {
      const deletionEvent = {
        ...buildSubscriptionUpdatedEvent({ status: 'canceled' }),
        type: 'customer.subscription.deleted',
      } as unknown as Stripe.CustomerSubscriptionDeletedEvent;

      // Deleted Stripe customer: listing its subscriptions returns nothing,
      // but retrieving the canceled subscription by id still works
      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [],
      );
      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'canceled' }),
      );

      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.ACTIVE),
      );

      await service.processStripeEvent(WORKSPACE_ID, deletionEvent);

      expect(
        stripeSubscriptionScheduleService.getSubscriptionWithSchedule,
      ).toHaveBeenCalledWith(
        mockStripeSubscriptionUpdatedEventWithoutUpdatedItem.data.object.id,
      );
      expect(workspaceService.suspendWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(workspaceService.reactivateWorkspace).not.toHaveBeenCalled();
    });

    it('should not transition a workspace that was soft-deleted mid-processing', async () => {
      const deletionEvent = {
        ...buildSubscriptionUpdatedEvent({ status: 'canceled' }),
        type: 'customer.subscription.deleted',
      } as unknown as Stripe.CustomerSubscriptionDeletedEvent;

      stripeSubscriptionScheduleService.listCustomerNotEndedSubscriptionsWithSchedule.mockResolvedValue(
        [
          buildLiveSubscription({
            id: 'sub_new_active_subscription',
            status: 'active',
          }),
        ],
      );
      stripeSubscriptionScheduleService.getSubscriptionWithSchedule.mockResolvedValue(
        buildLiveSubscription({ status: 'canceled' }),
      );

      // The workspace was soft-deleted mid-processing: billing must not
      // suspend or delete it, and the reactivation compare-and-swap refuses
      // soft-deleted workspaces (deletedAt IS NULL in its WHERE clause)
      workspaceRepository.findOne.mockResolvedValue(
        buildWorkspace(WorkspaceActivationStatus.SUSPENDED, new Date()),
      );
      workspaceService.reactivateWorkspace.mockResolvedValue(false);

      await service.processStripeEvent(WORKSPACE_ID, deletionEvent);

      expect(workspaceService.suspendWorkspace).not.toHaveBeenCalled();
      expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });
  });
});
