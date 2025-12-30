/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

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
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CleanWorkspaceDeletionWarningUserVarsJob,
  type CleanWorkspaceDeletionWarningUserVarsJobData,
} from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class BillingWebhookSubscriptionService {
  protected readonly logger = new Logger(
    BillingWebhookSubscriptionService.name,
  );
  constructor(
    private readonly stripeCustomerService: StripeCustomerService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly workspaceService: WorkspaceService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly stripeBillingAlertService: StripeBillingAlertService,
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

    if (!workspace) {
      return { noWorkspace: true };
    }

    if (
      isDefined(workspace.deletedAt) &&
      type !== BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_DELETED
    ) {
      return { noWorkspace: true };
    }

    await this.billingCustomerRepository.upsert(
      transformStripeSubscriptionEventToDatabaseCustomer(workspaceId, data),
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.billingSubscriptionRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscription(
        workspaceId,
        await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
          data.object.id,
        ),
      ),
      {
        conflictPaths: ['stripeSubscriptionId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const billingSubscriptions = await this.billingSubscriptionRepository.find({
      where: { workspaceId },
    });

    const updatedBillingSubscription = billingSubscriptions.find(
      (subscription) => subscription.stripeSubscriptionId === data.object.id,
    );

    if (!updatedBillingSubscription) {
      throw new BillingException(
        'Billing subscription not found after upsert',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    await this.updateBillingSubscriptionItems(
      updatedBillingSubscription.id,
      event,
    );

    const shouldSuspend = this.shouldSuspendWorkspace(data);

    if (shouldSuspend) {
      if (workspace.activationStatus === WorkspaceActivationStatus.ACTIVE) {
        await this.workspaceRepository.update(workspaceId, {
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
        });
      } else if (
        workspace.activationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION
      ) {
        await this.workspaceService.deleteWorkspace(workspace.id);
      }
    } else if (
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED
    ) {
      await this.workspaceRepository.update(workspaceId, {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });

      await this.messageQueueService.add<CleanWorkspaceDeletionWarningUserVarsJobData>(
        CleanWorkspaceDeletionWarningUserVarsJob.name,
        { workspaceId },
      );
    }

    await this.stripeCustomerService.updateCustomerMetadataWorkspaceId(
      String(data.object.customer),
      workspaceId,
    );

    if (event.type === BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_CREATED) {
      await this.billingSubscriptionService.setBillingThresholdsAndTrialPeriodWorkflowCredits(
        updatedBillingSubscription.id,
      );
      const gte =
        this.billingSubscriptionService.getTrialPeriodFreeWorkflowCredits(
          updatedBillingSubscription,
        );

      await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
        updatedBillingSubscription.stripeCustomerId,
        gte,
      );
    }

    return {
      stripeSubscriptionId: data.object.id,
      stripeCustomerId: data.object.customer,
    };
  }

  shouldSuspendWorkspace(
    data:
      | Stripe.CustomerSubscriptionUpdatedEvent.Data
      | Stripe.CustomerSubscriptionCreatedEvent.Data
      | Stripe.CustomerSubscriptionDeletedEvent.Data,
  ): boolean {
    const status = data.object.status as SubscriptionStatus;

    const suspendedStatuses = [
      SubscriptionStatus.Canceled,
      SubscriptionStatus.Unpaid,
      SubscriptionStatus.Paused, // TODO: remove this once paused subscriptions are deprecated
    ];

    if (suspendedStatuses.includes(status)) {
      return true;
    }

    const timeSinceTrialEnd = Date.now() / 1000 - (data.object.trial_end || 0);
    const hasTrialJustEnded =
      timeSinceTrialEnd > 0 && timeSinceTrialEnd < 60 * 60 * 24;

    return hasTrialJustEnded && status === SubscriptionStatus.PastDue;
  }

  async updateBillingSubscriptionItems(
    subscriptionId: string,
    event:
      | Stripe.CustomerSubscriptionUpdatedEvent
      | Stripe.CustomerSubscriptionCreatedEvent
      | Stripe.CustomerSubscriptionDeletedEvent,
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
      ),
      {
        conflictPaths: ['stripeSubscriptionItemId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
