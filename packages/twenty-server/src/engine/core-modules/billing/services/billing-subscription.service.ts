/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { differenceInDays } from 'date-fns';
import {
  assertIsDefinedOrThrow,
  assertUnreachable,
  findOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { Not, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import {
  getSubscriptionStatus,
  transformStripeSubscriptionEventToDatabaseSubscription,
} from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import {
  type SubscriptionUpdate,
  SubscriptionUpdateType,
} from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { computeSubscriptionUpdateOptions } from 'src/engine/core-modules/billing/utils/compute-subscription-update-options.util';
import { getCurrentLicensedBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-licensed-billing-subscription-item-or-throw.util';
import { getCurrentMeteredBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-metered-billing-subscription-item-or-throw.util';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { getSubscriptionPricesFromSchedulePhase } from 'src/engine/core-modules/billing/utils/get-subscription-prices-from-schedule-phase.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type SubscriptionStripePrices = {
  licensedPriceId: string;
  seats: number;
  meteredPriceId: string;
};
@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly billingPriceService: BillingPriceService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingProductService: BillingProductService,
    @InjectRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: Repository<BillingEntitlementEntity>,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly billingSubscriptionPhaseService: BillingSubscriptionPhaseService,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingSubscriptionEntity>,
    private readonly stripeBillingAlertService: StripeBillingAlertService,
  ) {}

  async getBillingSubscriptions(workspaceId: string) {
    return await this.billingSubscriptionRepository.find({
      where: { workspaceId },
    });
  }

  async getCurrentBillingSubscription(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }): Promise<BillingSubscriptionEntity | undefined> {
    const notCanceledSubscriptions =
      await this.billingSubscriptionRepository.find({
        where: { ...criteria, status: Not(SubscriptionStatus.Canceled) },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      });

    if (notCanceledSubscriptions.length > 1) {
      throw new BillingException(
        `More than one not canceled subscription for workspace ${criteria.workspaceId}`,
        BillingExceptionCode.BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND,
      );
    }

    return notCanceledSubscriptions[0];
  }

  async getCurrentBillingSubscriptionOrThrow(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }): Promise<BillingSubscriptionEntity> {
    const notCanceledSubscription =
      await this.getCurrentBillingSubscription(criteria);

    assertIsDefinedOrThrow(
      notCanceledSubscription,
      new BillingException(
        `No active subscription found for workspace ${criteria.workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      ),
    );

    return notCanceledSubscription;
  }

  async getBaseProductCurrentBillingSubscriptionItemOrThrow(
    workspaceId: string,
  ) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const planKey = getPlanKeyFromSubscription(billingSubscription);

    const baseProduct =
      await this.billingPlanService.getPlanBaseProduct(planKey);

    if (!baseProduct) {
      throw new BillingException(
        'Base product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    const stripeProductId = baseProduct.stripeProductId;

    const billingSubscriptionItem =
      billingSubscription.billingSubscriptionItems.filter(
        (billingSubscriptionItem) =>
          billingSubscriptionItem.stripeProductId === stripeProductId,
      )?.[0];

    if (!billingSubscriptionItem) {
      throw new Error(
        `Cannot find billingSubscriptionItem for product ${stripeProductId} for workspace ${workspaceId}`,
      );
    }

    return billingSubscriptionItem;
  }

  async deleteSubscriptions(workspaceId: string) {
    const subscriptionToCancel = await this.getCurrentBillingSubscription({
      workspaceId,
    });

    if (subscriptionToCancel) {
      await this.stripeSubscriptionService.cancelSubscription(
        subscriptionToCancel.stripeSubscriptionId,
      );
    }
    await this.billingSubscriptionRepository.delete({ workspaceId });
  }

  async handleUnpaidInvoices(data: Stripe.SetupIntentSucceededEvent.Data) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { stripeCustomerId: data.object.customer as string },
    );

    if (billingSubscription?.status === 'unpaid') {
      await this.stripeSubscriptionService.collectLastInvoice(
        billingSubscription.stripeSubscriptionId,
      );
    }

    return {
      handleUnpaidInvoiceStripeSubscriptionId:
        billingSubscription?.stripeSubscriptionId,
    };
  }

  async getWorkspaceEntitlementByKey(
    workspaceId: string,
    key: BillingEntitlementKey,
  ) {
    const entitlement = await this.billingEntitlementRepository.findOneBy({
      workspaceId,
      key,
      value: true,
    });

    if (!entitlement) {
      return false;
    }

    return entitlement.value;
  }

  async changeMeteredPrice(
    workspaceId: string,
    meteredPriceId: string,
  ): Promise<void> {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const subscriptionUpdate = {
      type: SubscriptionUpdateType.METERED_PRICE,
      newMeteredPriceId: meteredPriceId,
    } as const;

    const isScheduledForPeriodEnd =
      await this.shouldUpdateAtSubscriptionPeriodEnd(
        billingSubscription,
        subscriptionUpdate,
      );

    await this.updateSubscription(billingSubscription.id, subscriptionUpdate);

    if (!isScheduledForPeriodEnd) {
      await this.billingSubscriptionItemRepository.update(
        { stripeSubscriptionId: billingSubscription.stripeSubscriptionId },
        { hasReachedCurrentPeriodCap: false },
      );

      const newTierCap =
        await this.getWorkflowTierCapFromPriceId(meteredPriceId);

      await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
        billingSubscription.stripeCustomerId,
        newTierCap,
      );
    }
  }

  async cancelSwitchMeteredPrice(workspace: WorkspaceEntity): Promise<void> {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    const currentMeteredPrice =
      getCurrentMeteredBillingSubscriptionItemOrThrow(billingSubscription);

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.METERED_PRICE,
      newMeteredPriceId: currentMeteredPrice.stripePriceId,
    });
  }

  async endTrialPeriod(workspace: WorkspaceEntity) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    if (billingSubscription.status !== SubscriptionStatus.Trialing) {
      throw new BillingException(
        'Billing subscription is not in trial period',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD,
      );
    }

    const hasPaymentMethod = await this.stripeCustomerService.hasPaymentMethod(
      billingSubscription.stripeCustomerId,
    );

    if (!hasPaymentMethod) {
      return { hasPaymentMethod: false, status: undefined };
    }

    const updatedSubscription =
      await this.stripeSubscriptionService.updateSubscription(
        billingSubscription.stripeSubscriptionId,
        {
          trial_end: 'now',
        },
      );

    await this.billingSubscriptionItemRepository.update(
      { stripeSubscriptionId: updatedSubscription.id },
      { hasReachedCurrentPeriodCap: false },
    );

    await this.createBillingAlertForCustomer(
      billingSubscription.stripeCustomerId,
    );

    return {
      status: getSubscriptionStatus(updatedSubscription.status),
      hasPaymentMethod: true,
    };
  }

  async setBillingThresholdsAndTrialPeriodWorkflowCredits(
    billingSubscriptionId: string,
  ) {
    const billingSubscription =
      await this.billingSubscriptionRepository.findOneOrFail({
        where: { id: billingSubscriptionId },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      });

    const { stripePriceId: meterStripePriceId } = findOrThrow(
      billingSubscription.billingSubscriptionItems,
      (billingSubscriptionItem) =>
        billingSubscriptionItem.billingProduct.metadata.productKey ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    await this.stripeSubscriptionService.updateSubscription(
      billingSubscription.stripeSubscriptionId,
      {
        billing_thresholds:
          await this.billingPriceService.getBillingThresholdsByMeterPriceId(
            meterStripePriceId,
          ),
      },
    );

    const workflowSubscriptionItem =
      billingSubscription.billingSubscriptionItems.find(
        (item) =>
          item.billingProduct.metadata.productKey ===
          BillingProductKey.WORKFLOW_NODE_EXECUTION,
      );

    if (!workflowSubscriptionItem) {
      throw new BillingException(
        'Workflow subscription item not found',
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }
  }

  async cancelSwitchPlan(workspaceId: string) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const currentPlan =
      getCurrentLicensedBillingSubscriptionItemOrThrow(billingSubscription)
        .billingProduct?.metadata.planKey;

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.PLAN,
      newPlan: currentPlan,
    });
  }

  async cancelSwitchInterval(workspaceId: string) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const currentInterval = billingSubscription.interval;

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.INTERVAL,
      newInterval: currentInterval,
    });
  }

  async changeInterval(workspaceId: string) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const currentInterval = billingSubscription.interval;

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.INTERVAL,
      newInterval:
        currentInterval === SubscriptionInterval.Month
          ? SubscriptionInterval.Year
          : SubscriptionInterval.Month,
    });
  }

  async changePlan(workspaceId: string) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const currentPlan =
      getCurrentLicensedBillingSubscriptionItemOrThrow(billingSubscription)
        .billingProduct?.metadata.planKey;

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.PLAN,
      newPlan:
        currentPlan === BillingPlanKey.ENTERPRISE
          ? BillingPlanKey.PRO
          : BillingPlanKey.ENTERPRISE,
    });
  }

  async changeSeats(workspaceId: string, newSeats: number) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.SEATS,
      newSeats,
    });
  }

  async syncSubscriptionToDatabase(
    workspaceId: string,
    stripeSubscriptionId: string,
  ) {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );

    await this.billingCustomerRepository.upsert(
      transformStripeSubscriptionEventToDatabaseCustomer(workspaceId, {
        object: subscription,
      }),
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.billingSubscriptionRepository.upsert(
      transformStripeSubscriptionEventToDatabaseSubscription(
        workspaceId,
        subscription,
      ),
      {
        conflictPaths: ['stripeSubscriptionId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const billingSubscriptions = await this.billingSubscriptionRepository.find({
      where: { workspaceId },
    });

    const currentBillingSubscription = billingSubscriptions.find(
      (sub) => sub.stripeSubscriptionId === subscription.id,
    );

    if (!currentBillingSubscription) {
      throw new BillingException(
        'Billing subscription not found after creation',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    const billingSubscriptionItems =
      transformStripeSubscriptionEventToDatabaseSubscriptionItem(
        currentBillingSubscription.id,
        {
          object: subscription,
        },
      );

    const meterBillingSubscriptionItem = findOrThrow(
      billingSubscriptionItems,
      (item) => !isDefined(item.quantity),
    );

    const existingBillingSubscriptionItem =
      await this.billingSubscriptionItemRepository.findOne({
        where: {
          billingSubscriptionId: currentBillingSubscription.id,
          stripeProductId: meterBillingSubscriptionItem.stripeProductId,
        },
      });

    if (
      existingBillingSubscriptionItem?.stripeSubscriptionItemId !==
      meterBillingSubscriptionItem.stripeSubscriptionItemId
    ) {
      await this.billingSubscriptionItemRepository.delete({
        billingSubscriptionId: currentBillingSubscription.id,
        stripeProductId: meterBillingSubscriptionItem.stripeProductId,
      });
    }

    await this.billingSubscriptionItemRepository.upsert(
      billingSubscriptionItems,
      {
        conflictPaths: ['stripeSubscriptionItemId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    this.logger.log(
      `Subscription synced to database: ${subscription.id} for workspace: ${workspaceId}`,
    );

    return currentBillingSubscription;
  }

  getTrialPeriodFreeWorkflowCredits(
    billingSubscription: BillingSubscriptionEntity,
  ) {
    const trialDuration =
      isDefined(billingSubscription.trialEnd) &&
      isDefined(billingSubscription.trialStart)
        ? differenceInDays(
            billingSubscription.trialEnd,
            billingSubscription.trialStart,
          )
        : 0;

    const trialWithCreditCardDuration = this.twentyConfigService.get(
      'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
    );

    return Number(
      this.twentyConfigService.get(
        trialDuration === trialWithCreditCardDuration
          ? 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD'
          : 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
      ),
    );
  }

  async getWorkflowTierCapForSubscription(
    subscriptionId: string,
  ): Promise<number> {
    const subscription = await this.billingSubscriptionRepository.findOneOrFail(
      {
        where: { id: subscriptionId },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
          'billingSubscriptionItems.billingProduct.billingPrices',
        ],
      },
    );

    const workflowItem = subscription.billingSubscriptionItems.find(
      (item) =>
        item.billingProduct.metadata.productKey ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!isDefined(workflowItem)) {
      throw new BillingException(
        'Workflow subscription item not found',
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    const matchingPrice = workflowItem.billingProduct.billingPrices.find(
      (price) => price.stripePriceId === workflowItem.stripePriceId,
    );

    if (!isDefined(matchingPrice)) {
      throw new BillingException(
        `Cannot find price for product ${workflowItem.stripeProductId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    billingValidator.assertIsMeteredTiersSchemaOrThrow(matchingPrice.tiers);

    return matchingPrice.tiers[0].up_to;
  }

  async getWorkflowTierCapFromPriceId(meteredPriceId: string): Promise<number> {
    const price = await this.billingPriceRepository.findOneOrFail({
      where: { stripePriceId: meteredPriceId },
    });

    billingValidator.assertIsMeteredTiersSchemaOrThrow(price.tiers);

    return price.tiers[0].up_to;
  }

  async createBillingAlertForCustomer(
    stripeCustomerId: string,
  ): Promise<void> {
    const subscription = await this.getCurrentBillingSubscription({
      stripeCustomerId,
    });

    if (!isDefined(subscription)) {
      this.logger.warn(
        `Cannot create billing alert: subscription not found for stripeCustomerId ${stripeCustomerId}`,
      );

      return;
    }

    const tierCap = await this.getWorkflowTierCapForSubscription(
      subscription.id,
    );

    await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
      stripeCustomerId,
      tierCap,
    );
  }

  private async runSubscriptionUpdate({
    stripeSubscriptionId,
    licensedStripeItemId,
    meteredStripeItemId,
    licensedStripePriceId,
    meteredStripePriceId,
    seats,
    anchor,
    proration,
    metadata,
  }: {
    stripeSubscriptionId: string;
    licensedStripeItemId: string;
    meteredStripeItemId: string;
    licensedStripePriceId: string;
    meteredStripePriceId: string;
    seats: number;
    anchor?: Stripe.SubscriptionUpdateParams.BillingCycleAnchor;
    proration?: Stripe.SubscriptionUpdateParams.ProrationBehavior;
    metadata?: Record<string, string>;
  }) {
    return await this.stripeSubscriptionService.updateSubscription(
      stripeSubscriptionId,
      {
        items: [
          {
            id: licensedStripeItemId,
            price: licensedStripePriceId,
            quantity: seats,
          },
          { id: meteredStripeItemId, price: meteredStripePriceId },
        ],
        ...(anchor ? { billing_cycle_anchor: anchor } : {}),
        ...(proration ? { proration_behavior: proration } : {}),
        ...(metadata ? { metadata } : {}),
        billing_thresholds:
          await this.billingPriceService.getBillingThresholdsByMeterPriceId(
            meteredStripePriceId,
          ),
      },
    );
  }

  async updateSubscription(
    subscriptionId: string,
    subscriptionUpdate: SubscriptionUpdate,
  ): Promise<void> {
    const subscription = await this.billingSubscriptionRepository.findOneOrFail(
      {
        where: { id: subscriptionId },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      },
    );

    const licensedItem =
      getCurrentLicensedBillingSubscriptionItemOrThrow(subscription);
    const meteredItem =
      getCurrentMeteredBillingSubscriptionItemOrThrow(subscription);

    const toUpdateCurrentPrices = await this.computeSubscriptionPricesUpdate(
      subscriptionUpdate,
      {
        licensedPriceId: licensedItem.stripePriceId,
        meteredPriceId: meteredItem.stripePriceId,
        seats: licensedItem.quantity,
      },
    );

    const { schedule, currentPhase, nextPhase } =
      await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
        subscription.stripeSubscriptionId,
      );

    const shouldUpdateAtSubscriptionPeriodEnd =
      await this.shouldUpdateAtSubscriptionPeriodEnd(
        subscription,
        subscriptionUpdate,
      );

    if (shouldUpdateAtSubscriptionPeriodEnd) {
      if (!isDefined(schedule)) {
        const { schedule, currentPhase } =
          await this.stripeSubscriptionScheduleService.createSubscriptionSchedule(
            subscription.stripeSubscriptionId,
          );

        await this.runSubscriptionScheduleUpdate({
          stripeScheduleId: schedule.id,
          toUpdateCurrentPrices: undefined,
          toUpdateNextPrices: toUpdateCurrentPrices,
          currentPhase:
            this.billingSubscriptionPhaseService.toPhaseUpdateParams(
              currentPhase,
            ),
          subscriptionCurrentPeriodEnd: Math.floor(
            subscription.currentPeriodEnd.getTime() / 1000,
          ),
        });
      } else {
        assertIsDefinedOrThrow(nextPhase);
        assertIsDefinedOrThrow(currentPhase);

        const toUpdateNextPrices = await this.computeSubscriptionPricesUpdate(
          subscriptionUpdate,
          getSubscriptionPricesFromSchedulePhase(nextPhase),
        );

        await this.runSubscriptionScheduleUpdate({
          stripeScheduleId: schedule.id,
          toUpdateNextPrices,
          toUpdateCurrentPrices: undefined,
          currentPhase:
            this.billingSubscriptionPhaseService.toPhaseUpdateParams(
              currentPhase,
            ),
          subscriptionCurrentPeriodEnd: Math.floor(
            subscription.currentPeriodEnd.getTime() / 1000,
          ),
        });
      }
    } else {
      const subscriptionOptions =
        computeSubscriptionUpdateOptions(subscriptionUpdate);

      await this.runSubscriptionUpdate({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        licensedStripeItemId: licensedItem.stripeSubscriptionItemId,
        meteredStripeItemId: meteredItem.stripeSubscriptionItemId,
        licensedStripePriceId: toUpdateCurrentPrices.licensedPriceId,
        meteredStripePriceId: toUpdateCurrentPrices.meteredPriceId,
        seats: toUpdateCurrentPrices.seats,
        ...subscriptionOptions,
      });

      if (isDefined(nextPhase)) {
        assertIsDefinedOrThrow(schedule);
        const { currentPhase: refreshedCurrentPhase } =
          await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
            subscription.stripeSubscriptionId,
          );

        assertIsDefinedOrThrow(refreshedCurrentPhase);

        const nextPhasePrices =
          getSubscriptionPricesFromSchedulePhase(nextPhase);
        const toUpdateNextPrices = await this.computeSubscriptionPricesUpdate(
          subscriptionUpdate,
          nextPhasePrices,
        );

        await this.runSubscriptionScheduleUpdate({
          stripeScheduleId: schedule.id,
          toUpdateNextPrices,
          toUpdateCurrentPrices: undefined, //subscription update causes schedule current phase update
          currentPhase:
            this.billingSubscriptionPhaseService.toPhaseUpdateParams(
              refreshedCurrentPhase,
            ),
          subscriptionCurrentPeriodEnd: Math.floor(
            subscription.currentPeriodEnd.getTime() / 1000,
          ),
        });
      }
    }

    await this.syncSubscriptionToDatabase(
      subscription.workspaceId,
      subscription.stripeSubscriptionId,
    );
  }

  private async runSubscriptionScheduleUpdate({
    stripeScheduleId,
    toUpdateNextPrices,
    toUpdateCurrentPrices,
    currentPhase,
    subscriptionCurrentPeriodEnd,
  }: {
    stripeScheduleId: string;
    toUpdateNextPrices: SubscriptionStripePrices;
    toUpdateCurrentPrices: SubscriptionStripePrices | undefined;
    currentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
    subscriptionCurrentPeriodEnd: number;
  }) {
    let toUpdateCurrentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase = {
      ...currentPhase,
      end_date: subscriptionCurrentPeriodEnd,
    };

    if (isDefined(toUpdateCurrentPrices)) {
      toUpdateCurrentPhase =
        await this.billingSubscriptionPhaseService.buildPhaseUpdateParams({
          licensedStripePriceId: toUpdateCurrentPrices.licensedPriceId,
          seats: toUpdateCurrentPrices.seats,
          meteredStripePriceId: toUpdateCurrentPrices.meteredPriceId,
          endDate: subscriptionCurrentPeriodEnd,
          startDate: currentPhase.start_date,
        });
    }

    const toUpdateNextPhase =
      await this.billingSubscriptionPhaseService.buildPhaseUpdateParams({
        licensedStripePriceId: toUpdateNextPrices.licensedPriceId,
        seats: toUpdateNextPrices.seats,
        meteredStripePriceId: toUpdateNextPrices.meteredPriceId,
        startDate: subscriptionCurrentPeriodEnd,
        endDate: undefined,
      });

    if (
      await this.billingSubscriptionPhaseService.isSamePhaseSignature(
        toUpdateCurrentPhase,
        toUpdateNextPhase,
      )
    ) {
      return await this.stripeSubscriptionScheduleService.releaseSubscriptionSchedule(
        stripeScheduleId,
      );
    }

    return await this.stripeSubscriptionScheduleService.updateSchedule(
      stripeScheduleId,
      {
        phases: [toUpdateCurrentPhase, toUpdateNextPhase],
      },
    );
  }

  private async shouldUpdateAtSubscriptionPeriodEnd(
    subscription: BillingSubscriptionEntity,
    update: SubscriptionUpdate,
  ): Promise<boolean> {
    switch (update.type) {
      case SubscriptionUpdateType.PLAN: {
        const currentPlan =
          subscription.billingSubscriptionItems[0].billingProduct?.metadata
            .planKey;

        const isDowngrade =
          currentPlan !== update.newPlan &&
          update.newPlan === BillingPlanKey.PRO;

        return isDowngrade;
      }
      case SubscriptionUpdateType.METERED_PRICE: {
        const currentMeteredPriceId =
          subscription.billingSubscriptionItems.find(
            (item) => item.quantity == null,
          )?.stripePriceId;

        assertIsDefinedOrThrow(currentMeteredPriceId);
        const currentMeteredPrice =
          await this.billingPriceRepository.findOneOrFail({
            where: { stripePriceId: currentMeteredPriceId },
            relations: ['billingProduct'],
          });
        const newMeteredPrice = await this.billingPriceRepository.findOneOrFail(
          {
            where: { stripePriceId: update.newMeteredPriceId },
            relations: ['billingProduct'],
          },
        );

        billingValidator.assertIsMeteredPrice(currentMeteredPrice);
        billingValidator.assertIsMeteredPrice(newMeteredPrice);

        const currentMeteredCap = currentMeteredPrice.tiers[0].up_to;
        const newMeteredCap = newMeteredPrice.tiers[0].up_to;

        const isDowngrade = currentMeteredCap > newMeteredCap;

        return isDowngrade;
      }
      case SubscriptionUpdateType.SEATS:
        return false;
      case SubscriptionUpdateType.INTERVAL: {
        const currentInterval = subscription.interval;
        const isDowngrade =
          currentInterval !== update.newInterval &&
          update.newInterval === SubscriptionInterval.Month;

        return isDowngrade;
      }
      default: {
        return assertUnreachable(
          update,
          'Should never occur, add validator for new subscription update type',
        );
      }
    }
  }

  async computeSubscriptionPricesUpdate(
    update: SubscriptionUpdate,
    currentPrices: SubscriptionStripePrices,
  ): Promise<SubscriptionStripePrices> {
    switch (update.type) {
      case SubscriptionUpdateType.PLAN:
        return await this.computeSubscriptionPricesUpdateByPlan(
          update.newPlan,
          currentPrices,
        );
      case SubscriptionUpdateType.METERED_PRICE:
        return await this.computeSubscriptionPricesUpdateByMeteredPrice(
          update.newMeteredPriceId,
          currentPrices,
        );
      case SubscriptionUpdateType.SEATS:
        return this.computeSubscriptionPricesUpdateBySeats(
          update.newSeats,
          currentPrices,
        );
      case SubscriptionUpdateType.INTERVAL:
        return await this.computeSubscriptionPricesUpdateByInterval(
          update.newInterval,
          currentPrices,
        );
    }
  }

  private computeSubscriptionPricesUpdateBySeats(
    newSeats: number,
    currentPrices: SubscriptionStripePrices,
  ): SubscriptionStripePrices {
    return {
      ...currentPrices,
      seats: newSeats,
    };
  }

  private async computeSubscriptionPricesUpdateByMeteredPrice(
    newMeteredPriceId: string,
    currentPrices: SubscriptionStripePrices,
  ): Promise<SubscriptionStripePrices> {
    const currentLicensedPrice =
      await this.billingPriceRepository.findOneOrFail({
        where: { stripePriceId: currentPrices.licensedPriceId },
        relations: ['billingProduct'],
      });
    const currentInterval = currentLicensedPrice.interval;
    const currentPlanKey =
      currentLicensedPrice.billingProduct?.metadata.planKey;

    assertIsDefinedOrThrow(currentPlanKey);

    const newMeteredPrice = await this.billingPriceRepository.findOneOrFail({
      where: { stripePriceId: newMeteredPriceId },
      relations: ['billingProduct'],
    });

    billingValidator.assertIsMeteredPrice(newMeteredPrice);

    const newInterval = newMeteredPrice.interval;
    const newPlanKey = newMeteredPrice.billingProduct?.metadata.planKey;

    if (newInterval === currentInterval && currentPlanKey === newPlanKey) {
      return {
        ...currentPrices,
        meteredPriceId: newMeteredPriceId,
      };
    }

    const newEquivalentMeteredPrice =
      await this.billingPriceService.findEquivalentMeteredPrice({
        meteredPrice: newMeteredPrice,
        targetInterval: currentInterval,
        targetPlanKey: currentPlanKey,
        hasSameInterval: newInterval === currentInterval,
        hasSamePlanKey: currentPlanKey === newPlanKey,
      });

    return {
      ...currentPrices,
      meteredPriceId: newEquivalentMeteredPrice.stripePriceId,
    };
  }

  private async computeSubscriptionPricesUpdateByPlan(
    newPlan: BillingPlanKey,
    currentPrices: SubscriptionStripePrices,
  ): Promise<SubscriptionStripePrices> {
    const currentLicensedPrice =
      await this.billingPriceRepository.findOneOrFail({
        where: { stripePriceId: currentPrices.licensedPriceId },
        relations: ['billingProduct'],
      });

    const currentInterval = currentLicensedPrice.interval;
    const currentPlanKey =
      currentLicensedPrice.billingProduct?.metadata.planKey;

    assertIsDefinedOrThrow(currentPlanKey);

    if (currentPlanKey === newPlan) {
      return currentPrices;
    }

    const billingPricesPerPlanAndIntervalArray =
      await this.billingProductService.getProductPrices({
        interval: currentInterval,
        planKey: newPlan,
      });

    const targetLicensedPrice = findOrThrow(
      billingPricesPerPlanAndIntervalArray,
      ({ billingProduct }) =>
        billingProduct?.metadata.productKey === BillingProductKey.BASE_PRODUCT,
    );

    const currentMeteredPrice = await this.billingPriceRepository.findOneOrFail(
      {
        where: { stripePriceId: currentPrices.meteredPriceId },
        relations: ['billingProduct'],
      },
    );

    billingValidator.assertIsMeteredPrice(currentMeteredPrice);

    const targetMeteredPrice =
      await this.billingPriceService.findEquivalentMeteredPrice({
        meteredPrice: currentMeteredPrice,
        targetInterval: currentInterval,
        targetPlanKey: newPlan,
        hasSameInterval: true,
        hasSamePlanKey: false,
      });

    return {
      ...currentPrices,
      licensedPriceId: targetLicensedPrice.stripePriceId,
      meteredPriceId: targetMeteredPrice.stripePriceId,
    };
  }

  private async computeSubscriptionPricesUpdateByInterval(
    newInterval: SubscriptionInterval,
    currentPrices: SubscriptionStripePrices,
  ): Promise<SubscriptionStripePrices> {
    const currentLicensedPrice =
      await this.billingPriceRepository.findOneOrFail({
        where: { stripePriceId: currentPrices.licensedPriceId },
        relations: ['billingProduct'],
      });

    const currentInterval = currentLicensedPrice.interval;
    const currentPlanKey =
      currentLicensedPrice.billingProduct?.metadata.planKey;

    assertIsDefinedOrThrow(currentPlanKey);

    if (currentInterval === newInterval) {
      return currentPrices;
    }

    const billingPricesPerPlanAndIntervalArray =
      await this.billingProductService.getProductPrices({
        interval: newInterval,
        planKey: currentPlanKey,
      });

    const targetLicensedPrice = findOrThrow(
      billingPricesPerPlanAndIntervalArray,
      ({ billingProduct }) =>
        billingProduct?.metadata.productKey === BillingProductKey.BASE_PRODUCT,
    );

    const currentMeteredPrice = await this.billingPriceRepository.findOneOrFail(
      {
        where: { stripePriceId: currentPrices.meteredPriceId },
        relations: ['billingProduct'],
      },
    );

    billingValidator.assertIsMeteredPrice(currentMeteredPrice);

    const targetMeteredPrice =
      await this.billingPriceService.findEquivalentMeteredPrice({
        meteredPrice: currentMeteredPrice,
        targetInterval: newInterval,
        targetPlanKey: currentPlanKey,
        hasSameInterval: false,
        hasSamePlanKey: true,
      });

    return {
      ...currentPrices,
      licensedPriceId: targetLicensedPrice.stripePriceId,
      meteredPriceId: targetMeteredPrice.stripePriceId,
    };
  }
}
