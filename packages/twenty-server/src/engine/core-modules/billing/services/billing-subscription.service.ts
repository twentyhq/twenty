/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { Not, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { differenceInDays } from 'date-fns';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { findOrThrow } from 'src/utils/find-or-throw.util';
import { LicensedBillingSubscriptionItem } from 'src/engine/core-modules/billing/types/billing-subscription-item.type';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionSchedulePhase } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';
import { validator } from 'src/utils/assert-is-defined';
import { getOppositeInterval } from 'src/engine/core-modules/billing/utils/get-opposite-interval';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import { BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getOppositePlan } from 'src/engine/core-modules/billing/utils/get-opposite-plan';
import { getSubscriptionStatus } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';

@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingProductService: BillingProductService,
    @InjectRepository(BillingEntitlement)
    private readonly billingEntitlementRepository: Repository<BillingEntitlement>,
    @InjectRepository(BillingSubscription)
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(BillingPrice)
    private readonly billingPriceRepository: Repository<BillingPrice>,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    @InjectRepository(BillingSubscriptionItem)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly billingSubscriptionPhaseService: BillingSubscriptionPhaseService,
  ) {}

  async getBillingSubscriptions(workspaceId: string) {
    return await this.billingSubscriptionRepository.find({
      where: { workspaceId },
    });
  }

  async getCurrentBillingSubscriptionOrThrow(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }) {
    const notCanceledSubscriptions =
      await this.billingSubscriptionRepository.find({
        where: { ...criteria, status: Not(SubscriptionStatus.Canceled) },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      });

    assert(
      notCanceledSubscriptions.length <= 1,
      `More than one not canceled subscription for workspace ${criteria.workspaceId}`,
    );

    return notCanceledSubscriptions?.[0];
  }

  async getCurrentActiveBillingSubscriptionOrThrow(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }) {
    const subscription =
      await this.getCurrentBillingSubscriptionOrThrow(criteria);

    if (
      ![SubscriptionStatus.Active, SubscriptionStatus.Trialing].includes(
        subscription.status,
      )
    ) {
      throw new BillingException(
        'No active billing subscription found',
        BillingExceptionCode.BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND,
      );
    }

    return subscription;
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
    const subscriptionToCancel =
      await this.getCurrentBillingSubscriptionOrThrow({
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

  private async getBillingThresholdsByPriceId(priceId: string) {
    const price = await this.billingPriceRepository.findOneByOrFail({
      stripePriceId: priceId,
    });

    return this.stripeSubscriptionService.getBillingThresholdsByInterval(
      price.interval,
    );
  }

  async changeInterval(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    const nextInterval = getOppositeInterval(billingSubscription.interval);

    return this.setTargetInterval(billingSubscription, nextInterval);
  }

  async changePlan(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    const currentPlanKey =
      billingSubscription.billingSubscriptionItems[0].billingProduct.metadata
        .planKey;

    const nextPlanKey = getOppositePlan(currentPlanKey);

    return this.setTargetPlan(
      billingSubscription.stripeSubscriptionId,
      nextPlanKey,
    );
  }

  private getCurrentMeteredBillingSubscriptionItemOrThrow(
    billingSubscription: BillingSubscription,
  ) {
    return findOrThrow(
      billingSubscription.billingSubscriptionItems,
      ({ billingProduct }) =>
        billingProduct.metadata.priceUsageBased === BillingUsageType.METERED,
    );
  }

  private getCurrentLicensedBillingSubscriptionItemOrThrow(
    billingSubscription: BillingSubscription,
  ) {
    return findOrThrow(
      billingSubscription.billingSubscriptionItems,
      ({ billingProduct }) =>
        billingProduct.metadata.priceUsageBased === BillingUsageType.LICENSED,
    ) as LicensedBillingSubscriptionItem;
  }

  private async getMeteredBillingPriceByPriceId(stripePriceId: string) {
    const currentMeteredBillingPrice =
      await this.billingPriceRepository.findOneOrFail({
        where: {
          stripePriceId: stripePriceId,
        },
        relations: ['billingProduct'],
      });

    billingValidator.assertIsMeteredPrice(currentMeteredBillingPrice);

    return currentMeteredBillingPrice;
  }

  private async findMeteredMatchingPriceForPlanSwitching({
    billingPricesPerPlanAndIntervalArray,
    meteredPriceId,
  }: {
    billingPricesPerPlanAndIntervalArray: BillingPrice[];
    meteredPriceId: string;
  }) {
    const sourceMeteredBillingPrice =
      await this.getMeteredBillingPriceByPriceId(meteredPriceId);

    const sourcePlan =
      sourceMeteredBillingPrice.billingProduct.metadata.planKey;
    const targetPlan = getOppositePlan(sourcePlan);

    if (targetPlan === sourcePlan) {
      throw new BillingException(
        `Plan ${sourcePlan} is the same as the target plan ${targetPlan}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE,
      );
    }

    return findOrThrow(
      billingPricesPerPlanAndIntervalArray,
      (priceCandidate) => {
        return (
          billingValidator.isMeteredPrice(priceCandidate) &&
          priceCandidate.tiers[0].up_to ===
            sourceMeteredBillingPrice.tiers[0].up_to
        );
      },
    ) as BillingMeterPrice;
  }

  async findMeteredMatchingPriceForIntervalSwitching({
    billingPricesPerPlanAndIntervalArray,
    meteredPriceId,
  }: {
    billingPricesPerPlanAndIntervalArray: BillingPrice[];
    meteredPriceId: string;
  }): Promise<Omit<BillingPrice, 'tiers'> & { tiers: MeterBillingPriceTiers }> {
    const sourceMeteredBillingPrice =
      await this.getMeteredBillingPriceByPriceId(meteredPriceId);

    const sourceInterval = sourceMeteredBillingPrice.interval;

    if (!isDefined(sourceInterval)) {
      throw new BillingException(
        `Interval not found`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_INVALID,
      );
    }

    const targetInterval = getOppositeInterval(sourceInterval);

    if (sourceInterval === targetInterval) {
      throw new BillingException(
        `Interval ${sourceInterval} is the same as the target interval ${targetInterval}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE,
      );
    }

    const validCandidates = (
      billingPricesPerPlanAndIntervalArray.filter(
        (price) =>
          price.billingProduct.metadata.priceUsageBased ===
            BillingUsageType.METERED && price.interval === targetInterval,
      ) as Array<BillingMeterPrice>
    ).sort((a, b) => a.tiers[0].up_to - b.tiers[0].up_to);

    const factor =
      sourceInterval === SubscriptionInterval.Year &&
      targetInterval === SubscriptionInterval.Month
        ? 1 / 12
        : 12;

    const referenceCap = sourceMeteredBillingPrice.tiers[0].up_to * factor;

    return (
      validCandidates
        .filter((price) => price.tiers[0].up_to <= referenceCap)
        .sort((a, b) => a.tiers[0].up_to - b.tiers[0].up_to)
        .pop() ?? validCandidates[0]
    );
  }

  async endTrialPeriod(workspace: Workspace) {
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

    await this.stripeSubscriptionService.updateSubscription(
      billingSubscription.stripeSubscriptionId,
      {
        billing_thresholds: {
          amount_gte: this.twentyConfigService.get(
            'BILLING_SUBSCRIPTION_THRESHOLD_AMOUNT',
          ),
          reset_billing_cycle_anchor: false,
        },
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

    await this.stripeSubscriptionItemService.updateSubscriptionItem(
      workflowSubscriptionItem.stripeSubscriptionItemId,
      {
        metadata: {
          trialPeriodFreeWorkflowCredits:
            this.getTrialPeriodFreeWorkflowCredits(billingSubscription),
        },
      },
    );
  }

  private getTrialPeriodFreeWorkflowCredits(
    billingSubscription: BillingSubscription,
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

  private async findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
    interval,
    planKey,
    meteredPriceId,
    updateType,
  }: {
    interval: SubscriptionInterval;
    planKey: BillingPlanKey;
    meteredPriceId: string;
    updateType: 'interval' | 'plan';
  }) {
    const billingPricesPerPlanAndIntervalArray =
      await this.billingProductService.getProductPrices({
        interval,
        planKey,
      });

    const targetLicensedPrice = findOrThrow(
      billingPricesPerPlanAndIntervalArray,
      ({ billingProduct }) =>
        billingProduct.metadata.productKey === BillingProductKey.BASE_PRODUCT,
    );

    const targetMeteredPrice =
      updateType === 'interval'
        ? await this.findMeteredMatchingPriceForIntervalSwitching({
            billingPricesPerPlanAndIntervalArray,
            meteredPriceId: meteredPriceId,
          })
        : await this.findMeteredMatchingPriceForPlanSwitching({
            billingPricesPerPlanAndIntervalArray,
            meteredPriceId: meteredPriceId,
          });

    return {
      targetLicensedPrice,
      targetMeteredPrice,
    };
  }

  async cancelSwitchPlan(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    return this.setTargetPlan(
      billingSubscription.stripeSubscriptionId,
      BillingPlanKey.ENTERPRISE,
    );
  }

  async cancelSwitchInterval(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    return this.setTargetInterval(
      billingSubscription,
      SubscriptionInterval.Year,
    );
  }

  private async setTargetInterval(
    billingSubscription: BillingSubscription,
    targetInterval: SubscriptionInterval,
  ): Promise<void> {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        billingSubscription.stripeSubscriptionId,
      );
    const schedule =
      await this.stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule(
        subscription,
      );

    const currentPhase = schedule.phases[0];
    const currentDetails =
      await this.billingSubscriptionPhaseService.getDetailsFromPhase(
        currentPhase as BillingSubscriptionSchedulePhase,
      );

    const currentInterval = currentDetails.interval;
    const planKey = currentDetails.plan.planKey;
    const seats = currentDetails.quantity;
    const currentMeteredPriceId = currentDetails.meteredPrice.stripePriceId;

    // Case A: Already on target interval
    if (currentInterval === targetInterval) {
      const hasNext = !!schedule.phases?.[1];

      if (!hasNext) return;

      const nextPhase = schedule.phases[1];
      const nextDetails =
        await this.billingSubscriptionPhaseService.getDetailsFromPhase(
          nextPhase as BillingSubscriptionSchedulePhase,
        );

      if (nextDetails.interval !== targetInterval) {
        const { targetLicensedPrice, targetMeteredPrice } =
          await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
            interval: targetInterval,
            planKey: nextDetails.plan.planKey,
            meteredPriceId: nextDetails.meteredPrice.stripePriceId,
            updateType: 'interval',
          });

        return this.downgradeIntervalDeferred(
          billingSubscription.stripeSubscriptionId,
          {
            current: {
              licensedPriceId: (
                await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId(
                  {
                    interval: currentInterval,
                    planKey,
                    meteredPriceId: currentMeteredPriceId,
                    updateType: 'interval',
                  },
                )
              ).targetLicensedPrice.stripePriceId,
              meteredPriceId: currentMeteredPriceId,
              seats,
            },
            next: {
              licensedPriceId: targetLicensedPrice.stripePriceId,
              meteredPriceId: targetMeteredPrice.stripePriceId,
              seats: nextDetails.quantity,
            },
          },
        );
      }

      return;
    }

    // Case B: Month -> Year
    if (
      currentInterval === SubscriptionInterval.Month &&
      targetInterval === SubscriptionInterval.Year
    ) {
      if (billingSubscription.status === SubscriptionStatus.Trialing) {
        throw new BillingException(
          'Interval cannot be changed from Month to Year while trialing',
          BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE,
        );
      }
      const { targetLicensedPrice, targetMeteredPrice } =
        await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
          interval: SubscriptionInterval.Year,
          planKey,
          meteredPriceId: currentMeteredPriceId,
          updateType: 'interval',
        });

      return this.upgradeIntervalNowWithReanchor(
        billingSubscription.stripeSubscriptionId,
        {
          licensedPriceId: targetLicensedPrice.stripePriceId,
          meteredPriceId: targetMeteredPrice.stripePriceId,
          seats,
        },
      );
    }

    // Case C: Year -> Month
    if (
      currentInterval === SubscriptionInterval.Year &&
      targetInterval === SubscriptionInterval.Month
    ) {
      const hasNext = !!schedule.phases?.[1];
      const nextPhase = hasNext
        ? (schedule.phases[1] as BillingSubscriptionSchedulePhase)
        : undefined;
      const nextDetails = hasNext
        ? await this.billingSubscriptionPhaseService.getDetailsFromPhase(
            nextPhase!,
          )
        : undefined;

      const nextPlanKey = nextDetails?.plan.planKey ?? planKey;
      const nextMeteredPriceId =
        nextDetails?.meteredPrice.stripePriceId ?? currentMeteredPriceId;

      const currentPrices =
        await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
          interval: SubscriptionInterval.Month,
          planKey,
          meteredPriceId: currentMeteredPriceId,
          updateType: 'interval',
        });

      const nextPrices =
        await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
          interval: SubscriptionInterval.Month,
          planKey: nextPlanKey,
          meteredPriceId: nextMeteredPriceId,
          updateType: 'interval',
        });

      return this.downgradeIntervalDeferred(
        billingSubscription.stripeSubscriptionId,
        {
          current: {
            licensedPriceId: currentPrices.targetLicensedPrice.stripePriceId,
            meteredPriceId: currentMeteredPriceId,
            seats,
          },
          next: {
            licensedPriceId: nextPrices.targetLicensedPrice.stripePriceId,
            meteredPriceId: nextPrices.targetMeteredPrice.stripePriceId,
            seats,
          },
        },
      );
    }

    throw new BillingException(
      `Unhandled interval transition from ${currentInterval} to ${targetInterval}`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE,
    );
  }

  private async setTargetPlan(
    stripeSubscriptionId: string,
    targetPlanKey: BillingPlanKey,
  ): Promise<void> {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );
    const schedule =
      await this.stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule(
        subscription,
      );

    const currentPhase = schedule.phases[0];
    const currentDetails =
      await this.billingSubscriptionPhaseService.getDetailsFromPhase(
        currentPhase as BillingSubscriptionSchedulePhase,
      );

    const currentPlan = currentDetails.plan.planKey;
    const interval = currentDetails.interval;
    const seats = currentDetails.quantity;
    const currentMeteredPriceId = currentDetails.meteredPrice.stripePriceId;

    // Case A: Already on target plan
    if (currentPlan === targetPlanKey) {
      const hasNext = !!schedule.phases?.[1];

      if (!hasNext) return;

      const nextPhase = schedule.phases[1];
      const nextDetails =
        await this.billingSubscriptionPhaseService.getDetailsFromPhase(
          nextPhase as BillingSubscriptionSchedulePhase,
        );

      if (nextDetails.plan.planKey !== targetPlanKey) {
        const preservedNextInterval = nextDetails.interval;
        const preservedNextMeteredId = nextDetails.meteredPrice.stripePriceId;

        const { targetLicensedPrice, targetMeteredPrice } =
          await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
            interval: preservedNextInterval,
            planKey: targetPlanKey,
            meteredPriceId: preservedNextMeteredId,
            updateType: 'plan',
          });

        await this.downgradePlanDeferred(stripeSubscriptionId, {
          current: {
            licensedPriceId: (
              await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
                interval,
                planKey: currentPlan,
                meteredPriceId: currentMeteredPriceId,
                updateType: 'plan',
              })
            ).targetLicensedPrice.stripePriceId,
            meteredPriceId: currentMeteredPriceId,
            seats,
          },
          next: {
            licensedPriceId: targetLicensedPrice.stripePriceId,
            meteredPriceId: targetMeteredPrice.stripePriceId,
            seats: nextDetails.quantity,
            planKey: BillingPlanKey.PRO,
          },
        });
      }

      return;
    }

    // Case B: PRO -> ENTERPRISE (immediate)
    if (
      currentPlan === BillingPlanKey.PRO &&
      targetPlanKey === BillingPlanKey.ENTERPRISE
    ) {
      const { targetLicensedPrice, targetMeteredPrice } =
        await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
          interval,
          planKey: BillingPlanKey.ENTERPRISE,
          meteredPriceId: currentMeteredPriceId,
          updateType: 'plan',
        });

      await this.upgradePlanNow(stripeSubscriptionId, {
        licensedPriceId: targetLicensedPrice.stripePriceId,
        meteredPriceId: targetMeteredPrice.stripePriceId,
        seats,
        planMeta: BillingPlanKey.ENTERPRISE,
      });

      return;
    }

    // Case C: ENTERPRISE -> PRO (deferred)
    if (
      currentPlan === BillingPlanKey.ENTERPRISE &&
      targetPlanKey === BillingPlanKey.PRO
    ) {
      const hasNext = !!schedule.phases?.[1];
      const nextPhase = hasNext ? schedule.phases[1] : undefined;
      const nextDetails = hasNext
        ? await this.billingSubscriptionPhaseService.getDetailsFromPhase(
            nextPhase as BillingSubscriptionSchedulePhase,
          )
        : undefined;

      const preservedNextInterval = nextDetails?.interval ?? interval;
      const preservedNextMeteredId =
        nextDetails?.meteredPrice.stripePriceId ?? currentMeteredPriceId;

      const currentPrices =
        await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
          interval,
          planKey: currentPlan,
          meteredPriceId: currentMeteredPriceId,
          updateType: 'plan',
        });

      const nextPrices =
        await this.findBillingPricesFromIntervalAndPlanAndMeteredPriceId({
          interval: preservedNextInterval,
          planKey: BillingPlanKey.PRO,
          meteredPriceId: preservedNextMeteredId,
          updateType: 'plan',
        });

      await this.downgradePlanDeferred(stripeSubscriptionId, {
        current: {
          licensedPriceId: currentPrices.targetLicensedPrice.stripePriceId,
          meteredPriceId: currentMeteredPriceId,
          seats,
        },
        next: {
          licensedPriceId: nextPrices.targetLicensedPrice.stripePriceId,
          meteredPriceId: nextPrices.targetMeteredPrice.stripePriceId,
          seats,
          planKey: BillingPlanKey.PRO,
        },
      });

      return;
    }

    throw new BillingException(
      `Unhandled plan transition from ${currentPlan} to ${targetPlanKey}`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE,
    );
  }

  private getCurrentPhaseSnapshot(
    phase: Stripe.SubscriptionSchedule.Phase,
  ): Stripe.SubscriptionScheduleUpdateParams.Phase {
    const normalizePrice = (p: { id: string } | string) =>
      typeof p === 'string' ? p : p?.id;

    return {
      start_date: phase.start_date,
      end_date: phase.end_date,
      items: (phase.items || []).map((it) => ({
        price: normalizePrice(it.price),
        quantity: it.quantity ?? undefined,
      })),
      ...(phase.billing_thresholds
        ? { billing_thresholds: phase.billing_thresholds }
        : {}),
    } as Stripe.SubscriptionScheduleUpdateParams.Phase;
  }

  private async getPhaseSignature(
    phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): Promise<{
    planKey: BillingPlanKey;
    interval: SubscriptionInterval;
    meteredPriceId: string;
  }> {
    validator.assertIsDefined(phase.items?.[0]);
    validator.assertIsDefined(phase.items?.[1]);

    const licensedItem = findOrThrow(
      phase.items!,
      ({ quantity }) => quantity != null,
    );
    const meteredItem = findOrThrow(
      phase.items!,
      ({ quantity }) => quantity == null,
    );

    const licensedPriceId = String(licensedItem.price);
    const meteredPriceId = String(meteredItem.price);

    const licensedPrice = await this.billingPriceRepository.findOneOrFail({
      where: { stripePriceId: licensedPriceId },
      relations: ['billingProduct'],
    });

    const planKey = licensedPrice.billingProduct.metadata
      .planKey as BillingPlanKey;
    const interval = licensedPrice.interval as SubscriptionInterval;

    return { planKey, interval, meteredPriceId };
  }

  private async replaceSchedulePhases(
    scheduleId: string,
    phases: [
      Stripe.SubscriptionScheduleUpdateParams.Phase,
      Stripe.SubscriptionScheduleUpdateParams.Phase,
    ],
  ): Promise<void> {
    const [current, next] = phases;

    const [sigCur, sigNext] = await Promise.all([
      this.getPhaseSignature(current),
      this.getPhaseSignature(next),
    ]);

    const same =
      sigCur.planKey === sigNext.planKey &&
      sigCur.interval === sigNext.interval &&
      sigCur.meteredPriceId === sigNext.meteredPriceId;

    const phasesToSend: Stripe.SubscriptionScheduleUpdateParams.Phase[] = same
      ? [current]
      : [current, next];

    await this.stripeSubscriptionScheduleService.updateSchedule(scheduleId, {
      phases: phasesToSend,
    });
  }

  private async upgradePlanNow(
    stripeSubscriptionId: string,
    prices: {
      licensedPriceId: string;
      meteredPriceId: string;
      seats: number;
      planMeta?: BillingPlanKey;
    },
  ): Promise<void> {
    const sub = await this.billingSubscriptionRepository.findOneOrFail({
      where: { stripeSubscriptionId },
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
      ],
    });

    const licensed = this.getCurrentLicensedBillingSubscriptionItemOrThrow(sub);
    const metered = this.getCurrentMeteredBillingSubscriptionItemOrThrow(sub);

    await this.stripeSubscriptionService.updateSubscription(
      stripeSubscriptionId,
      {
        items: [
          {
            id: licensed.stripeSubscriptionItemId,
            price: prices.licensedPriceId,
            quantity: prices.seats,
          },
          {
            id: metered.stripeSubscriptionItemId,
            price: prices.meteredPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        ...(prices.planMeta
          ? { metadata: { ...(sub?.metadata || {}), plan: prices.planMeta } }
          : {}),
      },
    );
  }

  private async upgradeIntervalNowWithReanchor(
    stripeSubscriptionId: string,
    prices: {
      licensedPriceId: string;
      meteredPriceId: string;
      seats: number;
    },
  ): Promise<void> {
    const sub = await this.billingSubscriptionRepository.findOneOrFail({
      where: { stripeSubscriptionId },
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
      ],
    });

    const licensed = this.getCurrentLicensedBillingSubscriptionItemOrThrow(sub);
    const metered = this.getCurrentMeteredBillingSubscriptionItemOrThrow(sub);

    await this.stripeSubscriptionService.updateSubscription(
      stripeSubscriptionId,
      {
        items: [
          {
            id: licensed.stripeSubscriptionItemId,
            price: prices.licensedPriceId,
            quantity: prices.seats,
          },
          {
            id: metered.stripeSubscriptionItemId,
            price: prices.meteredPriceId,
          },
        ],
        billing_cycle_anchor: 'now',
        proration_behavior: 'create_prorations',
        billing_thresholds: await this.getBillingThresholdsByPriceId(
          prices.licensedPriceId,
        ),
      },
    );
  }

  private async downgradePlanDeferred(
    stripeSubscriptionId: string,
    prices: {
      current: {
        licensedPriceId: string;
        meteredPriceId: string;
        seats: number;
      };
      next: {
        licensedPriceId: string;
        meteredPriceId: string;
        seats: number;
        planKey: BillingPlanKey.PRO;
      };
    },
  ): Promise<void> {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );
    const schedule =
      await this.stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule(
        subscription,
      );

    const current = this.getCurrentPhaseSnapshot(schedule.phases[0]);
    const next: Stripe.SubscriptionScheduleUpdateParams.Phase = {
      items: [
        { price: prices.next.licensedPriceId, quantity: prices.next.seats },
        { price: prices.next.meteredPriceId },
      ],
      start_date: current.end_date ?? subscription.current_period_end,
      proration_behavior: 'none',
      billing_thresholds: await this.getBillingThresholdsByPriceId(
        prices.next.licensedPriceId,
      ),
    };

    await this.replaceSchedulePhases(schedule.id, [current, next]);
  }

  private async downgradeIntervalDeferred(
    stripeSubscriptionId: string,
    prices: {
      current: {
        licensedPriceId: string;
        meteredPriceId: string;
        seats: number;
      };
      next: { licensedPriceId: string; meteredPriceId: string; seats: number };
    },
  ): Promise<void> {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );
    const schedule =
      await this.stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule(
        subscription,
      );

    const current = this.getCurrentPhaseSnapshot(schedule.phases[0]);
    const next: Stripe.SubscriptionScheduleUpdateParams.Phase = {
      items: [
        { price: prices.next.licensedPriceId, quantity: prices.next.seats },
        { price: prices.next.meteredPriceId },
      ],
      start_date: current.end_date ?? subscription.current_period_end,
      proration_behavior: 'none',
      billing_thresholds: await this.getBillingThresholdsByPriceId(
        prices.next.licensedPriceId,
      ),
    };

    await this.replaceSchedulePhases(schedule.id, [current, next]);
  }
}
