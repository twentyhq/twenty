/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';
import {
  assertIsDefinedOrThrow,
  findOrThrow,
  isDefined,
} from 'twenty-shared/utils';
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
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { LicensedBillingSubscriptionItem } from 'src/engine/core-modules/billing/types/billing-subscription-item.type';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionSchedulePhase } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';
import { getOppositeInterval } from 'src/engine/core-modules/billing/utils/get-opposite-interval';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import { BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getOppositePlan } from 'src/engine/core-modules/billing/utils/get-opposite-plan';
import {
  getSubscriptionStatus,
  transformStripeSubscriptionEventToDatabaseSubscription,
} from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { ensureFutureStartDate } from 'src/engine/core-modules/billing/utils/ensure-future-start-date.util';

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
    @InjectRepository(BillingSubscriptionItem)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly billingSubscriptionPhaseService: BillingSubscriptionPhaseService,
    @InjectRepository(BillingCustomer)
    private readonly billingCustomerRepository: Repository<BillingSubscription>,
  ) {}

  async getBillingSubscriptions(workspaceId: string) {
    return await this.billingSubscriptionRepository.find({
      where: { workspaceId },
    });
  }

  async getCurrentBillingSubscription(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }): Promise<BillingSubscription | undefined> {
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
  }): Promise<BillingSubscription> {
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
    workspace: Workspace,
    meteredPriceId: string,
  ): Promise<void> {
    const {
      billingSubscription,
      subscription,
      schedule,
      currentEditable,
      nextEditable,
      currentPhaseDetails,
      currentCap,
      targetCap,
      mappedCurrentMeteredId,
      mappedNextMeteredId,
    } = await this.loadInitialState(workspace, meteredPriceId);
    const isUpgrade = targetCap > currentCap;
    const {
      subscription: updatedSubscription,
      schedule: updatedSchedule,
      currentEditable: updatedCurrentEditable,
      nextEditable: updatedNextEditable,
    } = (await this.maybeUpgradeNowIfHigherTier(
      billingSubscription,
      currentPhaseDetails,
      targetCap,
      currentCap,
      mappedCurrentMeteredId,
    )) ?? {
      subscription,
      schedule,
      currentEditable,
      nextEditable,
    };

    const { currentMutated, nextMutated } = await this.buildSnapshots(
      updatedCurrentEditable,
      updatedNextEditable,
      currentPhaseDetails,
      mappedCurrentMeteredId,
      mappedNextMeteredId,
      updatedSubscription.current_period_end,
      isUpgrade,
    );

    const nextForUpdate = await this.dedupeNextPhase(
      currentMutated,
      nextMutated,
    );

    await this.stripeSubscriptionScheduleService.replaceEditablePhases(
      updatedSchedule.id,
      {
        currentSnapshot: currentMutated ?? undefined,
        nextPhase: nextForUpdate,
      },
    );

    const refreshed =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        updatedSubscription.id,
      );

    await this.syncSubscriptionToDatabase(
      billingSubscription.workspaceId,
      refreshed,
    );
  }

  async cancelSwitchMeteredPrice(workspace: Workspace): Promise<void> {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );
    const { currentEditable } = await this.loadScheduleEditable(
      billingSubscription.stripeSubscriptionId,
    );

    const currentPhaseDetails =
      await this.billingSubscriptionPhaseService.getDetailsFromPhase(
        currentEditable as BillingSubscriptionSchedulePhase,
      );

    await this.changeMeteredPrice(
      workspace,
      currentPhaseDetails.meteredPrice.stripePriceId,
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
  }

  async getMeteredBillingPriceByPriceId(stripePriceId: string) {
    assertIsDefinedOrThrow(stripePriceId);

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

  async syncSubscriptionToDatabase(
    workspaceId: string,
    subscription: Stripe.Subscription | SubscriptionWithSchedule,
  ) {
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
        typeof subscription.schedule === 'string'
          ? await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
              subscription.id,
            )
          : (subscription as SubscriptionWithSchedule),
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

  private async getBillingThresholdsByPriceId(priceId: string) {
    const price = await this.billingPriceRepository.findOneByOrFail({
      stripePriceId: priceId,
    });

    return this.stripeSubscriptionService.getBillingThresholdsByInterval(
      price.interval,
    );
  }

  private async loadScheduleEditable(stripeSubscriptionId: string) {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );

    const schedule =
      await this.stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule(
        subscription,
      );

    const { currentEditable, nextEditable } =
      this.stripeSubscriptionScheduleService.getEditablePhases(schedule);

    return { subscription, schedule, currentEditable, nextEditable };
  }

  private async mapTargetMeteredForPhase(
    planKey: BillingPlanKey,
    interval: SubscriptionInterval,
    targetMeteredPriceId: string,
  ): Promise<string> {
    const prices = await this.billingProductService.getProductPrices({
      interval,
      planKey,
    });
    const mapped = await this.findMeteredMatchingPriceForMeteredPriceSwitching({
      billingPricesPerPlanAndIntervalArray: prices,
      targetMeteredPriceId,
      interval,
    });

    return mapped.stripePriceId;
  }

  private async replaceCurrentMeteredItem(
    billingSubscription: BillingSubscription,
    newMeteredPriceId: string,
    licensedPriceIdForThresholds: string,
  ): Promise<void> {
    const licensedItem =
      this.getCurrentLicensedBillingSubscriptionItemOrThrow(
        billingSubscription,
      );
    const meteredItem =
      this.getCurrentMeteredBillingSubscriptionItemOrThrow(billingSubscription);

    const updated = await this.updateSubscription({
      stripeSubscriptionId: billingSubscription.stripeSubscriptionId,
      licensedItemId: licensedItem.stripeSubscriptionItemId,
      meteredItemId: meteredItem.stripeSubscriptionItemId,
      licensedPriceId: licensedItem.stripePriceId,
      meteredPriceId: newMeteredPriceId,
      seats: licensedItem.quantity,
      proration: 'none',
      thresholdsPriceId: licensedPriceIdForThresholds,
    });

    await this.syncSubscriptionToDatabase(
      billingSubscription.workspaceId,
      updated,
    );
  }

  private async loadInitialState(
    workspace: Workspace,
    meteredPriceId: string,
  ): Promise<{
    billingSubscription: BillingSubscription;
    subscription: SubscriptionWithSchedule;
    schedule: Stripe.SubscriptionSchedule;
    currentEditable: Stripe.SubscriptionSchedule.Phase | undefined;
    nextEditable: Stripe.SubscriptionSchedule.Phase | undefined;
    currentPhaseDetails: Awaited<
      ReturnType<BillingSubscriptionPhaseService['getDetailsFromPhase']>
    >;
    nextPhaseDetailsInitial:
      | Awaited<
          ReturnType<BillingSubscriptionPhaseService['getDetailsFromPhase']>
        >
      | undefined;
    currentCap: number;
    targetCap: number;
    mappedCurrentMeteredId: string;
    mappedNextMeteredId: string;
  }> {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );
    let { subscription, schedule, currentEditable, nextEditable } =
      await this.loadScheduleEditable(billingSubscription.stripeSubscriptionId);

    if (!isDefined(currentEditable)) {
      throw new BillingException(
        'No editable phase found for current subscription',
        BillingExceptionCode.BILLING_SUBSCRIPTION_PHASE_NOT_FOUND,
      );
    }
    const currentPhaseDetails =
      await this.billingSubscriptionPhaseService.getDetailsFromPhase(
        currentEditable as BillingSubscriptionSchedulePhase,
      );
    const hasNextInitially = !!nextEditable;
    const nextPhaseDetailsInitial = hasNextInitially
      ? await this.billingSubscriptionPhaseService.getDetailsFromPhase(
          nextEditable as BillingSubscriptionSchedulePhase,
        )
      : undefined;
    const currentCap = (currentPhaseDetails.meteredPrice as BillingMeterPrice)
      .tiers[0].up_to;
    const targetCap = (
      await this.getMeteredBillingPriceByPriceId(meteredPriceId)
    ).tiers[0].up_to;
    const mappedCurrentMeteredId = await this.mapTargetMeteredForPhase(
      currentPhaseDetails.plan.planKey,
      currentPhaseDetails.interval,
      meteredPriceId,
    );
    const mappedNextMeteredId = await this.mapTargetMeteredForPhase(
      nextPhaseDetailsInitial?.plan.planKey ?? currentPhaseDetails.plan.planKey,
      nextPhaseDetailsInitial?.interval ?? currentPhaseDetails.interval,
      meteredPriceId,
    );

    return {
      billingSubscription,
      subscription,
      schedule,
      currentEditable,
      nextEditable,
      currentPhaseDetails,
      nextPhaseDetailsInitial,
      currentCap,
      targetCap,
      mappedCurrentMeteredId,
      mappedNextMeteredId,
    };
  }

  private async maybeUpgradeNowIfHigherTier(
    billingSubscription: BillingSubscription,
    currentPhaseDetails: Awaited<
      ReturnType<BillingSubscriptionPhaseService['getDetailsFromPhase']>
    >,
    targetCap: number,
    currentCap: number,
    mappedCurrentMeteredId: string,
  ): Promise<
    | {
        subscription: SubscriptionWithSchedule;
        schedule: Stripe.SubscriptionSchedule;
        currentEditable: Stripe.SubscriptionSchedule.Phase | undefined;
        nextEditable: Stripe.SubscriptionSchedule.Phase | undefined;
      }
    | undefined
  > {
    if (targetCap > currentCap) {
      const currentLicensedId = currentPhaseDetails.licensedPrice.stripePriceId;

      await this.replaceCurrentMeteredItem(
        billingSubscription,
        mappedCurrentMeteredId,
        currentLicensedId,
      );
      const { subscription, schedule, currentEditable, nextEditable } =
        await this.loadScheduleEditable(
          billingSubscription.stripeSubscriptionId,
        );

      return { subscription, schedule, currentEditable, nextEditable };
    }

    return undefined;
  }

  private async buildSnapshots(
    currentEditable: Stripe.SubscriptionSchedule.Phase | undefined,
    nextEditable: Stripe.SubscriptionSchedule.Phase | undefined,
    currentPhaseDetails: Awaited<
      ReturnType<BillingSubscriptionPhaseService['getDetailsFromPhase']>
    >,
    mappedCurrentMeteredId: string,
    mappedNextMeteredId: string,
    subscriptionCurrentPeriodEnd: number | undefined,
    mutateCurrentNow: boolean,
  ): Promise<{
    currentSnap: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined;
    nextSnap: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined;
    currentLicensedId: string;
    nextLicensedId: string;
    currentMutated: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined;
    nextMutated: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined;
  }> {
    const isCurrentEditableDefined = isDefined(currentEditable);
    const currentSnap = isCurrentEditableDefined
      ? this.billingSubscriptionPhaseService.toSnapshot(currentEditable)
      : undefined;
    const hasNext = !!nextEditable;
    const nextPhaseDetails = hasNext
      ? await this.billingSubscriptionPhaseService.getDetailsFromPhase(
          nextEditable as BillingSubscriptionSchedulePhase,
        )
      : undefined;
    const currentLicensedId = currentSnap
      ? this.billingSubscriptionPhaseService.getLicensedPriceIdFromSnapshot(
          currentSnap,
        )
      : currentPhaseDetails.licensedPrice.stripePriceId;
    const nextSnap = hasNext
      ? this.billingSubscriptionPhaseService.toSnapshot(nextEditable)
      : undefined;
    const nextLicensedId = nextSnap
      ? this.billingSubscriptionPhaseService.getLicensedPriceIdFromSnapshot(
          nextSnap,
        )
      : currentLicensedId;
    const currentMutated = currentSnap
      ? mutateCurrentNow
        ? this.billingSubscriptionPhaseService.buildSnapshot(
            currentSnap,
            currentLicensedId,
            currentPhaseDetails.quantity,
            mappedCurrentMeteredId,
            await this.getBillingThresholdsByPriceId(currentLicensedId),
          )
        : currentSnap
      : undefined;

    const baseItems = (currentSnap?.items ?? nextSnap?.items) as
      | Stripe.SubscriptionScheduleUpdateParams.Phase.Item[]
      | undefined;

    if (!baseItems) {
      throw new BillingException(
        'Cannot build next phase: no items found on current or next snapshot',
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    const nextPhaseBase: Stripe.SubscriptionScheduleUpdateParams.Phase = {
      start_date: ensureFutureStartDate(
        (currentSnap?.end_date as number | undefined) ??
          subscriptionCurrentPeriodEnd,
      ),
      items: baseItems,
      proration_behavior: 'none',
    };
    const nextMutated = this.billingSubscriptionPhaseService.buildSnapshot(
      nextPhaseBase,
      nextLicensedId,
      nextPhaseDetails?.quantity ?? currentPhaseDetails.quantity,
      mappedNextMeteredId,
      await this.getBillingThresholdsByPriceId(nextLicensedId),
    );

    return {
      currentSnap,
      nextSnap,
      currentLicensedId,
      nextLicensedId,
      currentMutated,
      nextMutated,
    };
  }

  private async dedupeNextPhase(
    currentMutated: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined,
    nextMutated: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined,
  ): Promise<Stripe.SubscriptionScheduleUpdateParams.Phase | undefined> {
    return currentMutated &&
      nextMutated &&
      (await this.billingSubscriptionPhaseService.isSamePhaseSignature(
        currentMutated,
        nextMutated,
      ))
      ? undefined
      : nextMutated;
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

  getTrialPeriodFreeWorkflowCredits(billingSubscription: BillingSubscription) {
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

  private async resolvePrices({
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
        billingProduct?.metadata.productKey === BillingProductKey.BASE_PRODUCT,
    );

    const targetMeteredPrice =
      updateType === 'interval'
        ? await this.findMeteredMatchingPriceForIntervalSwitching({
            billingPricesPerPlanAndIntervalArray,
            meteredPriceId: meteredPriceId,
            targetInterval: interval,
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

  private async setTargetInterval(
    billingSubscription: BillingSubscription,
    targetInterval: SubscriptionInterval,
  ): Promise<void> {
    const { currentEditable } = await this.loadScheduleEditable(
      billingSubscription.stripeSubscriptionId,
    );

    const currentDetails =
      await this.billingSubscriptionPhaseService.getDetailsFromPhase(
        currentEditable as BillingSubscriptionSchedulePhase,
      );
    const { nextEditable } = await this.loadScheduleEditable(
      billingSubscription.stripeSubscriptionId,
    );

    const currentInterval = currentDetails.interval;
    const planKey = currentDetails.plan.planKey;
    const seats = currentDetails.quantity;
    const currentMeteredPriceId = currentDetails.meteredPrice.stripePriceId;

    // Case A: Already on target interval
    if (currentInterval === targetInterval) {
      const hasNext = !!nextEditable;

      if (!hasNext) return;

      const nextDetails =
        await this.billingSubscriptionPhaseService.getDetailsFromPhase(
          nextEditable as BillingSubscriptionSchedulePhase,
        );

      if (nextDetails.interval !== targetInterval) {
        const { targetLicensedPrice, targetMeteredPrice } =
          await this.resolvePrices({
            interval: targetInterval,
            planKey: nextDetails.plan.planKey,
            meteredPriceId: nextDetails.meteredPrice.stripePriceId,
            updateType: 'interval',
          });

        return this.downgradeDeferred(
          billingSubscription.stripeSubscriptionId,
          {
            current: {
              licensedPriceId: (
                await this.resolvePrices({
                  interval: currentInterval,
                  planKey,
                  meteredPriceId: currentMeteredPriceId,
                  updateType: 'interval',
                })
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
        await this.resolvePrices({
          interval: SubscriptionInterval.Year,
          planKey,
          meteredPriceId: currentMeteredPriceId,
          updateType: 'interval',
        });

      await this.upgradeIntervalNowWithReanchor(
        billingSubscription.stripeSubscriptionId,
        {
          licensedPriceId: targetLicensedPrice.stripePriceId,
          meteredPriceId: targetMeteredPrice.stripePriceId,
          seats,
        },
      );

      const { currentEditable, nextEditable, subscription, schedule } =
        await this.loadScheduleEditable(
          billingSubscription.stripeSubscriptionId,
        );

      if (nextEditable && currentEditable) {
        const reloadedNextDetails =
          await this.billingSubscriptionPhaseService.getDetailsFromPhase(
            nextEditable as BillingSubscriptionSchedulePhase,
          );

        const mappedNext = await this.resolvePrices({
          interval: SubscriptionInterval.Year,
          planKey: reloadedNextDetails.plan.planKey,
          meteredPriceId: reloadedNextDetails.meteredPrice.stripePriceId,
          updateType: 'interval',
        });

        const currentSnap =
          this.billingSubscriptionPhaseService.toSnapshot(currentEditable);

        const nextPhaseForYear =
          this.billingSubscriptionPhaseService.buildSnapshot(
            {
              start_date: ensureFutureStartDate(
                (currentSnap?.end_date as number | undefined) ??
                  subscription.current_period_end,
              ),
              items: currentSnap.items,
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
            mappedNext.targetLicensedPrice.stripePriceId,
            reloadedNextDetails.quantity,
            mappedNext.targetMeteredPrice.stripePriceId,
            await this.getBillingThresholdsByPriceId(
              mappedNext.targetLicensedPrice.stripePriceId,
            ),
          );

        return await this.scheduleReplaceNext({
          subscription,
          scheduleId: schedule.id,
          currentSnapshot: currentSnap,
          nextPhase: nextPhaseForYear,
        });
      }

      return;
    }

    // Case C: Year -> Month
    if (
      currentInterval === SubscriptionInterval.Year &&
      targetInterval === SubscriptionInterval.Month
    ) {
      const hasNext = !!nextEditable;

      const nextDetails = hasNext
        ? await this.billingSubscriptionPhaseService.getDetailsFromPhase(
            nextEditable as BillingSubscriptionSchedulePhase,
          )
        : undefined;

      const nextPlanKey = nextDetails?.plan.planKey ?? planKey;
      const nextMeteredPriceId =
        nextDetails?.meteredPrice.stripePriceId ?? currentMeteredPriceId;

      const currentPrices = await this.resolvePrices({
        interval: SubscriptionInterval.Month,
        planKey,
        meteredPriceId: currentMeteredPriceId,
        updateType: 'interval',
      });

      const nextPrices = await this.resolvePrices({
        interval: SubscriptionInterval.Month,
        planKey: nextPlanKey,
        meteredPriceId: nextMeteredPriceId,
        updateType: 'interval',
      });

      return this.downgradeDeferred(billingSubscription.stripeSubscriptionId, {
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
      });
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
    const { currentEditable, nextEditable } =
      await this.loadScheduleEditable(stripeSubscriptionId);

    const currentDetails =
      await this.billingSubscriptionPhaseService.getDetailsFromPhase(
        currentEditable as BillingSubscriptionSchedulePhase,
      );

    const currentPlan = currentDetails.plan.planKey;
    const interval = currentDetails.interval;
    const seats = currentDetails.quantity;
    const currentMeteredPriceId = currentDetails.meteredPrice.stripePriceId;

    // Case A: Already on target plan
    if (currentPlan === targetPlanKey) {
      const hasNext = !!nextEditable;

      if (!hasNext) return;

      const nextDetails =
        await this.billingSubscriptionPhaseService.getDetailsFromPhase(
          nextEditable as BillingSubscriptionSchedulePhase,
        );

      if (nextDetails.plan.planKey !== targetPlanKey) {
        const preservedNextInterval = nextDetails.interval;
        const preservedNextMeteredId = nextDetails.meteredPrice.stripePriceId;

        const { targetLicensedPrice, targetMeteredPrice } =
          await this.resolvePrices({
            interval: preservedNextInterval,
            planKey: targetPlanKey,
            meteredPriceId: preservedNextMeteredId,
            updateType: 'plan',
          });

        await this.downgradeDeferred(stripeSubscriptionId, {
          current: {
            licensedPriceId: (
              await this.resolvePrices({
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
        await this.resolvePrices({
          interval,
          planKey: targetPlanKey,
          meteredPriceId: currentMeteredPriceId,
          updateType: 'plan',
        });

      await this.upgradePlanNow(stripeSubscriptionId, {
        licensedPriceId: targetLicensedPrice.stripePriceId,
        meteredPriceId: targetMeteredPrice.stripePriceId,
        seats,
        planMeta: targetPlanKey,
      });

      return;
    }

    // Case C: ENTERPRISE -> PRO (deferred)
    if (
      currentPlan === BillingPlanKey.ENTERPRISE &&
      targetPlanKey === BillingPlanKey.PRO
    ) {
      const hasNext = !!nextEditable;

      const nextDetails = hasNext
        ? await this.billingSubscriptionPhaseService.getDetailsFromPhase(
            nextEditable as BillingSubscriptionSchedulePhase,
          )
        : undefined;

      const preservedNextInterval = nextDetails?.interval ?? interval;
      const preservedNextMeteredId =
        nextDetails?.meteredPrice.stripePriceId ?? currentMeteredPriceId;

      const currentPrices = await this.resolvePrices({
        interval,
        planKey: currentPlan,
        meteredPriceId: currentMeteredPriceId,
        updateType: 'plan',
      });

      const nextPrices = await this.resolvePrices({
        interval: preservedNextInterval,
        planKey: targetPlanKey,
        meteredPriceId: preservedNextMeteredId,
        updateType: 'plan',
      });

      return await this.downgradeDeferred(stripeSubscriptionId, {
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
    }

    throw new BillingException(
      `Unhandled plan transition from ${currentPlan} to ${targetPlanKey}`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE,
    );
  }

  private async updateSubscription(params: {
    stripeSubscriptionId: string;
    licensedItemId: string;
    meteredItemId: string;
    licensedPriceId: string;
    meteredPriceId: string;
    seats: number;
    anchor?: Stripe.SubscriptionUpdateParams.BillingCycleAnchor;
    proration?: Stripe.SubscriptionUpdateParams.ProrationBehavior;
    thresholdsPriceId?: string;
    metadata?: Record<string, string>;
  }) {
    const {
      stripeSubscriptionId,
      licensedItemId,
      meteredItemId,
      licensedPriceId,
      meteredPriceId,
      seats,
      anchor,
      proration,
      thresholdsPriceId,
      metadata,
    } = params;

    return this.stripeSubscriptionService.updateSubscription(
      stripeSubscriptionId,
      {
        items: [
          { id: licensedItemId, price: licensedPriceId, quantity: seats },
          { id: meteredItemId, price: meteredPriceId },
        ],
        ...(anchor ? { billing_cycle_anchor: anchor } : {}),
        ...(proration ? { proration_behavior: proration } : {}),
        ...(thresholdsPriceId
          ? {
              billing_thresholds:
                await this.getBillingThresholdsByPriceId(thresholdsPriceId),
            }
          : {}),
        ...(metadata ? { metadata } : {}),
      },
    );
  }

  private async scheduleReplaceNext(params: {
    scheduleId: string;
    subscription: SubscriptionWithSchedule | Stripe.Subscription;
    currentSnapshot: Stripe.SubscriptionScheduleUpdateParams.Phase;
    nextPhase?: Stripe.SubscriptionScheduleUpdateParams.Phase;
  }): Promise<void> {
    const { scheduleId, currentSnapshot, subscription } = params;
    let { nextPhase } = params;

    if (
      nextPhase &&
      (await this.billingSubscriptionPhaseService.isSamePhaseSignature(
        currentSnapshot,
        nextPhase,
      ))
    ) {
      nextPhase = undefined;
    }

    await this.stripeSubscriptionScheduleService.replaceEditablePhases(
      scheduleId,
      {
        currentSnapshot,
        nextPhase,
      },
    );
    const refreshed =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        subscription.id,
      );
    const workspaceId = (
      await this.billingSubscriptionRepository.findOneByOrFail({
        stripeSubscriptionId: refreshed.id,
      })
    ).workspaceId;

    await this.syncSubscriptionToDatabase(workspaceId, refreshed);
  }

  private async upgradePlanNow(
    stripeSubscriptionId: string,
    newPrices: {
      licensedPriceId: string;
      meteredPriceId: string;
      seats: number;
      planMeta?: BillingPlanKey;
    },
  ): Promise<void> {
    const currentSubscription =
      await this.billingSubscriptionRepository.findOneOrFail({
        where: { stripeSubscriptionId },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      });

    const currentLicenseSubsciptionItem =
      this.getCurrentLicensedBillingSubscriptionItemOrThrow(
        currentSubscription,
      );
    const currentMeteredSubsciptionItem =
      this.getCurrentMeteredBillingSubscriptionItemOrThrow(currentSubscription);

    const updatedSubscription = await this.updateSubscription({
      stripeSubscriptionId,
      licensedItemId: currentLicenseSubsciptionItem.stripeSubscriptionItemId,
      meteredItemId: currentMeteredSubsciptionItem.stripeSubscriptionItemId,
      licensedPriceId: newPrices.licensedPriceId,
      meteredPriceId: newPrices.meteredPriceId,
      seats: newPrices.seats,
      proration: 'create_prorations',
      metadata: newPrices.planMeta
        ? { ...(currentSubscription?.metadata || {}), plan: newPrices.planMeta }
        : undefined,
    });

    await this.syncSubscriptionToDatabase(
      currentSubscription.workspaceId,
      updatedSubscription,
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

    const updatedSubscription = await this.updateSubscription({
      stripeSubscriptionId,
      licensedItemId: licensed.stripeSubscriptionItemId,
      meteredItemId: metered.stripeSubscriptionItemId,
      licensedPriceId: prices.licensedPriceId,
      meteredPriceId: prices.meteredPriceId,
      seats: prices.seats,
      anchor: 'now',
      proration: 'create_prorations',
      thresholdsPriceId: prices.licensedPriceId,
    });

    await this.syncSubscriptionToDatabase(sub.workspaceId, updatedSubscription);
  }

  private async downgradeDeferred(
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
        planKey?: BillingPlanKey;
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

    const { currentEditable } =
      this.stripeSubscriptionScheduleService.getEditablePhases(schedule);
    const current = this.billingSubscriptionPhaseService.toSnapshot(
      currentEditable as Stripe.SubscriptionSchedule.Phase,
    );
    const next = this.billingSubscriptionPhaseService.buildSnapshot(
      {
        start_date: current.end_date ?? subscription.current_period_end,
        items: current.items,
        proration_behavior: 'none',
      } as Stripe.SubscriptionScheduleUpdateParams.Phase,
      prices.next.licensedPriceId,
      prices.next.seats,
      prices.next.meteredPriceId,
      await this.getBillingThresholdsByPriceId(prices.next.licensedPriceId),
    );

    await this.scheduleReplaceNext({
      scheduleId: schedule.id,
      subscription,
      currentSnapshot: current,
      nextPhase: next,
    });
  }

  private scaleCap(
    cap: number,
    from: SubscriptionInterval,
    to: SubscriptionInterval,
  ) {
    if (from === to) return cap;

    return from === SubscriptionInterval.Month &&
      to === SubscriptionInterval.Year
      ? cap * 12
      : cap / 12;
  }

  private filterMeteredCandidates(
    catalog: BillingPrice[],
    interval?: SubscriptionInterval,
  ) {
    const pool = interval
      ? catalog.filter((p) => p.interval === interval)
      : catalog;

    return (
      pool.filter((p) =>
        billingValidator.isMeteredPrice(p),
      ) as BillingMeterPrice[]
    ).sort((a, b) => a.tiers[0].up_to - b.tiers[0].up_to);
  }

  private async findMeteredMatchFloor(
    catalog: BillingPrice[],
    referencePriceId: string,
    targetInterval?: SubscriptionInterval,
  ): Promise<BillingMeterPrice> {
    const reference =
      await this.getMeteredBillingPriceByPriceId(referencePriceId);

    const refCap = targetInterval
      ? this.scaleCap(
          reference.tiers[0].up_to,
          reference.interval,
          targetInterval,
        )
      : reference.tiers[0].up_to;

    const candidates = this.filterMeteredCandidates(catalog, targetInterval);

    if (!candidates.length) {
      throw new BillingException(
        'No metered candidates found for mapping',
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    return (
      candidates.filter((p) => p.tiers[0].up_to <= refCap).pop() ??
      candidates[0]
    );
  }

  async findMeteredMatchingPriceForIntervalSwitching({
    billingPricesPerPlanAndIntervalArray,
    meteredPriceId,
    targetInterval,
  }: {
    billingPricesPerPlanAndIntervalArray: BillingPrice[];
    meteredPriceId: string;
    targetInterval: SubscriptionInterval;
  }): Promise<Omit<BillingPrice, 'tiers'> & { tiers: MeterBillingPriceTiers }> {
    const mapped = await this.findMeteredMatchFloor(
      billingPricesPerPlanAndIntervalArray,
      meteredPriceId,
      targetInterval,
    );

    return mapped as BillingMeterPrice;
  }

  async findMeteredMatchingPriceForPlanSwitching({
    billingPricesPerPlanAndIntervalArray,
    meteredPriceId,
  }: {
    billingPricesPerPlanAndIntervalArray: BillingPrice[];
    meteredPriceId: string;
  }): Promise<BillingMeterPrice> {
    return (await this.findMeteredMatchFloor(
      billingPricesPerPlanAndIntervalArray,
      meteredPriceId,
    )) as BillingMeterPrice;
  }

  async findMeteredMatchingPriceForMeteredPriceSwitching({
    billingPricesPerPlanAndIntervalArray,
    targetMeteredPriceId,
    interval,
  }: {
    billingPricesPerPlanAndIntervalArray: BillingPrice[];
    targetMeteredPriceId: string;
    interval: SubscriptionInterval;
  }): Promise<BillingMeterPrice> {
    return this.findMeteredMatchFloor(
      billingPricesPerPlanAndIntervalArray,
      targetMeteredPriceId,
      interval,
    );
  }
}
