/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addDays } from 'date-fns';
import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent } from 'src/engine/core-modules/billing-webhook/utils/get-deleted-stripe-subscription-item-ids-from-stripe-subscription-event.util';
import { getChargeStatusFromInterChargeStatus } from 'src/engine/core-modules/billing-webhook/utils/getChargeStatus';
import { interToSubscriptionStatusMap } from 'src/engine/core-modules/billing-webhook/utils/inter-to-subsciption-status.mapper';
import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import { transformStripeSubscriptionEventToDatabaseSubscription } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { InterChargeStatus } from 'src/engine/core-modules/inter/enums/InterChargeStatus.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CleanWorkspaceDeletionWarningUserVarsJob,
  CleanWorkspaceDeletionWarningUserVarsJobData,
} from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';

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
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(BillingCharge, 'core')
    private readonly billingChargeRepository: Repository<BillingCharge>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly workspaceService: WorkspaceService,
    private readonly billingPlanService: BillingPlanService,
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

    await this.updateBillingSubscriptionItems(
      updatedBillingSubscription.id,
      event,
    );

    if (
      this.shouldSuspendWorkspace({ stripeData: data }) &&
      workspace.activationStatus == WorkspaceActivationStatus.ACTIVE
    ) {
      await this.workspaceRepository.update(workspaceId, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });
    }

    if (
      this.shouldSuspendWorkspace({ stripeData: data }) &&
      workspace.activationStatus === WorkspaceActivationStatus.PENDING_CREATION
    ) {
      await this.workspaceService.deleteWorkspace(workspace.id);
    }

    if (
      !this.shouldSuspendWorkspace({ stripeData: data }) &&
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

    if (event.type === BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_CREATED) {
      await this.billingSubscriptionService.setBillingThresholdsAndTrialPeriodWorkflowCredits(
        updatedBillingSubscription.id,
      );
    }

    return {
      stripeSubscriptionId: data.object.id,
      stripeCustomerId: data.object.customer,
    };
  }

  async processInterEvent(seuNumero: string, situacao: InterChargeStatus) {
    const billingCharge = await this.billingChargeRepository.findOneBy({
      chargeCode: seuNumero,
    });

    if (!billingCharge)
      throw new BillingException(
        `Billing charge not found`,
        BillingExceptionCode.BILLING_CHARGE_NOT_FOUND,
      );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: billingCharge.metadata.workspaceId },
      withDeleted: true,
    });

    if (!workspace) {
      this.logger.warn(
        `Workspace not found for interBillingChargeId: ${seuNumero}`,
      );

      return { noWorkspace: true };
    }

    const customer = await this.billingCustomerRepository.findOne({
      where: {
        workspaceId: workspace.id,
      },
    });

    const now = new Date(Date.now());

    await this.billingSubscriptionRepository.upsert(
      {
        workspaceId: workspace.id,
        interBillingChargeId: seuNumero,
        status: interToSubscriptionStatusMap[situacao],
        provider: BillingPaymentProviders.Inter,
        interval: SubscriptionInterval.Month,
        stripeCustomerId: customer?.stripeCustomerId,
        currentPeriodStart: now,
        currentPeriodEnd: addDays(now, 30),
        currency: 'BRL',
        collectionMethod: BillingSubscriptionCollectionMethod.SEND_INVOICE,
        metadata: {
          workspaceId: workspace.id,
          plan: billingCharge.metadata.planKey,
        },
      },
      {
        conflictPaths: ['interBillingChargeId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const subscription = await this.billingSubscriptionRepository.findOne({
      where: {
        interBillingChargeId: seuNumero,
      },
    });

    if (!subscription)
      throw new BillingException(
        `Subscription not found`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );

    await this.billingChargeRepository.update(billingCharge.id, {
      status: getChargeStatusFromInterChargeStatus(situacao),
      billingSubscriptionId: subscription.id,
    });

    const billingPricesPerPlan = await this.billingPlanService.getPricesPerPlan(
      {
        planKey: billingCharge.metadata.planKey,
        interval: SubscriptionInterval.Month,
      },
    );

    const { baseProductPrice } = billingPricesPerPlan;

    await this.billingSubscriptionItemRepository.save({
      billingSubscriptionId: subscription.id,
      stripeProductId: baseProductPrice.stripeProductId,
      stripePriceId: baseProductPrice.stripePriceId,
      metadata: {
        trialPeriodFreeWorkflowCredits: 0,
      },
    });

    const billingSubscriptions = await this.billingSubscriptionRepository.find({
      where: { workspaceId: workspace.id },
    });

    const updatedBillingSubscription = billingSubscriptions.find(
      (subscription) => subscription.interBillingChargeId === seuNumero,
    );

    if (!updatedBillingSubscription) {
      throw new Error('Billing subscription not found');
    }

    if (
      this.shouldSuspendWorkspace({ interStatus: situacao }) &&
      workspace.activationStatus === WorkspaceActivationStatus.ACTIVE
    ) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });
    }

    if (
      !this.shouldSuspendWorkspace({ interStatus: situacao }) &&
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED
    ) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });

      await this.messageQueueService.add<CleanWorkspaceDeletionWarningUserVarsJobData>(
        CleanWorkspaceDeletionWarningUserVarsJob.name,
        { workspaceId: workspace.id },
      );
    }

    return {
      interBillingChargeId: seuNumero,
    };
  }

  shouldSuspendWorkspace({
    stripeData,
    interStatus,
  }: {
    stripeData?:
      | Stripe.CustomerSubscriptionUpdatedEvent.Data
      | Stripe.CustomerSubscriptionCreatedEvent.Data
      | Stripe.CustomerSubscriptionDeletedEvent.Data;
    interStatus?: InterChargeStatus;
  }) {
    if (stripeData) {
      const timeSinceTrialEnd =
        Date.now() / 1000 - (stripeData.object.trial_end || 0);
      const hasTrialJustEnded =
        timeSinceTrialEnd < 60 * 60 * 24 && timeSinceTrialEnd > 0;

      if (
        [
          SubscriptionStatus.Canceled,
          SubscriptionStatus.Unpaid,
          SubscriptionStatus.Paused, // TODO: remove this once paused subscriptions are deprecated
        ].includes(stripeData.object.status as SubscriptionStatus) ||
        (hasTrialJustEnded &&
          stripeData.object.status === SubscriptionStatus.PastDue)
      ) {
        return true;
      }

      return false;
    }

    if (interStatus) {
      return ['ATRASADO', 'CANCELADO', 'EXPIRADO'].includes(interStatus);
    }

    return false;
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
