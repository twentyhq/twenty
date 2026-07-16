/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import type Stripe from 'stripe';

import { getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent } from 'src/engine/core-modules/billing-webhook/utils/get-deleted-stripe-subscription-item-ids-from-stripe-subscription-event.util';
import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import { transformStripeSubscriptionEventToDatabaseSubscription } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { WORKSPACE_ACTIVATING_SUBSCRIPTION_STATUSES } from 'src/engine/core-modules/billing/constants/workspace-activating-subscription-statuses.constant';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  CleanWorkspaceDeletionWarningUserVarsJob,
  type CleanWorkspaceDeletionWarningUserVarsJobData,
} from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class BillingWebhookSubscriptionService {
  protected readonly logger = new Logger(
    BillingWebhookSubscriptionService.name,
  );
  constructor(
    private readonly stripeCustomerService: StripeCustomerService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    // Stripe webhook upserts conflict-resolve globally on stripeSubscriptionId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    private readonly workspaceService: WorkspaceService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly billingUsageCacheService: BillingUsageCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async processStripeEvent(
    workspaceId: string,
    event:
      | Stripe.CustomerSubscriptionUpdatedEvent
      | Stripe.CustomerSubscriptionCreatedEvent
      | Stripe.CustomerSubscriptionDeletedEvent,
  ) {
    const { data, type } = event;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      withDeleted: true,
    });

    if (!isDefined(workspace)) {
      throw new BillingException(
        `Workspace not found for subscription event ${event.id} / workspaceId: ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: msg`Workspace ${workspaceId} is not found.`,
        },
      );
    }

    if (
      isDefined(workspace.deletedAt) &&
      type !== BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_DELETED
    ) {
      throw new BillingException(
        `Workspace not found for subscription event ${event.id} / workspaceId: ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: msg`Workspace ${workspaceId} is not found.`,
        },
      );
    }

    await this.billingCustomerRepository.upsert(
      workspaceId,
      transformStripeSubscriptionEventToDatabaseCustomer(workspaceId, data),
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    // Fetch every subscription of the customer live from Stripe: the event
    // payload can be stale and sibling subscription rows in the database are
    // only as fresh as their own last webhook.
    const liveCustomerSubscriptions =
      await this.stripeSubscriptionScheduleService.listCustomerSubscriptionsWithSchedule(
        String(data.object.customer),
      );

    const subscriptionWithSchedule = liveCustomerSubscriptions.find(
      (customerSubscription) => customerSubscription.id === data.object.id,
    );

    if (!isDefined(subscriptionWithSchedule)) {
      throw new BillingException(
        `Subscription ${data.object.id} not found on Stripe customer ${String(data.object.customer)} for event ${event.id}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    await this.billingSubscriptionRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscription(
        workspaceId,
        subscriptionWithSchedule,
      ),
      {
        conflictPaths: ['stripeSubscriptionId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const updatedBillingSubscription =
      await this.billingSubscriptionRepository.findOne({
        where: { workspaceId, stripeSubscriptionId: data.object.id },
      });

    if (!isDefined(updatedBillingSubscription)) {
      throw new BillingException(
        'Billing subscription not found after upsert',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    await this.updateBillingSubscriptionItems(
      updatedBillingSubscription.id,
      event,
      workspaceId,
    );

    await this.billingUsageCacheService.flushAvailableCredits(workspace.id);
    await this.workspaceCacheService.invalidateAndRecompute(workspace.id, [
      'currentBillingSubscription',
    ]);

    // Stripe events can arrive out of order or concurrently: decide from the
    // live subscription state and a fresh workspace read, not the event payload.
    const refreshedWorkspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      withDeleted: true,
    });

    if (!isDefined(refreshedWorkspace)) {
      throw new BillingException(
        `Workspace not found on re-read for subscription event ${event.id} / workspaceId: ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: msg`Workspace ${workspaceId} is not found.`,
        },
      );
    }

    const hasOtherActivatingSubscription = liveCustomerSubscriptions.some(
      (customerSubscription) =>
        customerSubscription.id !== data.object.id &&
        WORKSPACE_ACTIVATING_SUBSCRIPTION_STATUSES.includes(
          customerSubscription.status as SubscriptionStatus,
        ),
    );

    const shouldSuspendWorkspace =
      !hasOtherActivatingSubscription &&
      this.shouldSuspendWorkspace(subscriptionWithSchedule);
    const shouldReactivateWorkspace =
      !shouldSuspendWorkspace &&
      (hasOtherActivatingSubscription ||
        this.shouldReactivateWorkspace(subscriptionWithSchedule));

    // A soft-deleted workspace is past billing-driven transitions: the cleaner
    // cron owns its lifecycle from here (destroy or manual restore).
    const isWorkspaceSoftDeleted = isDefined(refreshedWorkspace.deletedAt);

    if (shouldSuspendWorkspace && !isWorkspaceSoftDeleted) {
      if (
        refreshedWorkspace.activationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION
      ) {
        await this.workspaceService.deleteWorkspace(workspaceId);
      } else if (
        refreshedWorkspace.activationStatus === WorkspaceActivationStatus.ACTIVE
      ) {
        await this.workspaceService.suspendWorkspace(workspaceId);
      }
    }

    if (shouldReactivateWorkspace && !isWorkspaceSoftDeleted) {
      // Guarded transition: only applies if the workspace is still SUSPENDED or
      // CREATED and not soft-deleted, so a stale workspace read cannot skip it
      // nor reactivate a workspace it should not.
      const hasBeenReactivated =
        await this.workspaceService.reactivateWorkspace(workspaceId);

      if (hasBeenReactivated) {
        await this.messageQueueService.add<CleanWorkspaceDeletionWarningUserVarsJobData>(
          CleanWorkspaceDeletionWarningUserVarsJob.name,
          { workspaceId },
        );
      }
    }

    await this.stripeCustomerService.updateCustomerMetadataWorkspaceId(
      String(data.object.customer),
      workspaceId,
    );

    return {
      stripeSubscriptionId: data.object.id,
      stripeCustomerId: data.object.customer,
    };
  }

  shouldSuspendWorkspace(subscription: SubscriptionWithSchedule): boolean {
    const status = subscription.status as SubscriptionStatus;

    const suspendedStatuses = [
      SubscriptionStatus.Canceled,
      SubscriptionStatus.Unpaid,
    ];

    if (suspendedStatuses.includes(status)) {
      return true;
    }

    const timeSinceTrialEnd = Date.now() / 1000 - (subscription.trial_end || 0);
    const hasTrialJustEnded =
      timeSinceTrialEnd > 0 && timeSinceTrialEnd < 60 * 60 * 24;

    const canceledDuringTrial =
      subscription.cancel_at_period_end &&
      isDefined(subscription.canceled_at) &&
      isDefined(subscription.trial_end) &&
      subscription.canceled_at <= subscription.trial_end;

    return (
      hasTrialJustEnded &&
      (status === SubscriptionStatus.PastDue || canceledDuringTrial)
    );
  }

  shouldReactivateWorkspace(subscription: SubscriptionWithSchedule): boolean {
    const status = subscription.status as SubscriptionStatus;

    return WORKSPACE_ACTIVATING_SUBSCRIPTION_STATUSES.includes(status);
  }

  async updateBillingSubscriptionItems(
    subscriptionId: string,
    event:
      | Stripe.CustomerSubscriptionUpdatedEvent
      | Stripe.CustomerSubscriptionCreatedEvent
      | Stripe.CustomerSubscriptionDeletedEvent,
    workspaceId: string,
  ) {
    const deletedSubscriptionItemIds =
      getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent(event);

    if (deletedSubscriptionItemIds.length > 0) {
      await this.billingSubscriptionItemRepository.delete({
        billingSubscriptionId: subscriptionId,
        stripeSubscriptionItemId: In(deletedSubscriptionItemIds),
      });
    }

    await this.billingSubscriptionItemRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscriptionItem(
        subscriptionId,
        event.data,
        workspaceId,
      ),
      {
        conflictPaths: ['stripeSubscriptionItemId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
