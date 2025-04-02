/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing/webhooks/utils/transform-stripe-subscription-event-to-database-customer.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing/webhooks/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import { transformStripeSubscriptionEventToDatabaseSubscription } from 'src/engine/core-modules/billing/webhooks/utils/transform-stripe-subscription-event-to-database-subscription.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CleanWorkspaceDeletionWarningUserVarsJob,
  CleanWorkspaceDeletionWarningUserVarsJobData,
} from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';

const BILLING_SUBSCRIPTION_STATUS_BY_WORKSPACE_ACTIVATION_STATUS = {
  [WorkspaceActivationStatus.ACTIVE]: [
    SubscriptionStatus.Active,
    SubscriptionStatus.Trialing,
    SubscriptionStatus.PastDue,
  ],
  [WorkspaceActivationStatus.SUSPENDED]: [
    SubscriptionStatus.Canceled,
    SubscriptionStatus.Unpaid,
    SubscriptionStatus.Paused,
  ],
};

@Injectable()
export class BillingWebhookSubscriptionService {
  protected readonly logger = new Logger(
    BillingWebhookSubscriptionService.name,
  );
  constructor(
    private readonly stripeCustomerService: StripeCustomerService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
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

    if (
      !workspace ||
      (isDefined(workspace?.deletedAt) &&
        type !== BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_DELETED)
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
      transformStripeSubscriptionEventToDatabaseSubscription(workspaceId, data),
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
      throw new Error('Billing subscription not found');
    }

    await this.billingSubscriptionItemRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscriptionItem(
        updatedBillingSubscription.id,
        data,
      ),
      {
        conflictPaths: ['billingSubscriptionId', 'stripeProductId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const isMeteredProductBillingEnabled =
      await this.featureFlagRepository.findOneBy({
        key: FeatureFlagKey.IsMeteredProductBillingEnabled,
        workspaceId,
        value: true,
      });

    if (
      type === BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_CREATED &&
      data.object.status === SubscriptionStatus.Trialing &&
      isMeteredProductBillingEnabled
    ) {
      await this.billingSubscriptionItemService.createPreliminarySubscriptionItemsForMeteredProducts(
        updatedBillingSubscription,
      );
    }

    const wasTrialOrPausedSubscription = [
      SubscriptionStatus.Trialing,
      SubscriptionStatus.Paused,
    ].includes(data.previous_attributes?.status as SubscriptionStatus);

    if (wasTrialOrPausedSubscription && isMeteredProductBillingEnabled) {
      await this.billingSubscriptionService.convertTrialSubscriptionToSubscriptionWithMeteredProducts(
        updatedBillingSubscription,
      );
    }

    const hasActiveWorkspaceCompatibleSubscription = billingSubscriptions.some(
      (subscription) =>
        BILLING_SUBSCRIPTION_STATUS_BY_WORKSPACE_ACTIVATION_STATUS[
          WorkspaceActivationStatus.ACTIVE
        ].includes(subscription.status),
    );

    if (
      BILLING_SUBSCRIPTION_STATUS_BY_WORKSPACE_ACTIVATION_STATUS[
        WorkspaceActivationStatus.SUSPENDED
      ].includes(data.object.status as SubscriptionStatus) &&
      workspace.activationStatus == WorkspaceActivationStatus.ACTIVE &&
      !hasActiveWorkspaceCompatibleSubscription
    ) {
      await this.workspaceRepository.update(workspaceId, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });
    }

    if (
      BILLING_SUBSCRIPTION_STATUS_BY_WORKSPACE_ACTIVATION_STATUS[
        WorkspaceActivationStatus.ACTIVE
      ].includes(data.object.status as SubscriptionStatus) &&
      workspace.activationStatus == WorkspaceActivationStatus.SUSPENDED
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

    return {
      stripeSubscriptionId: data.object.id,
      stripeCustomerId: data.object.customer,
    };
  }
}
