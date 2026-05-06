/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  assertIsDefinedOrThrow,
  assertUnreachable,
  findOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import {
  type SubscriptionUpdate,
  SubscriptionUpdateType,
} from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { computeSubscriptionUpdateOptions } from 'src/engine/core-modules/billing/utils/compute-subscription-update-options.util';
import { getBaseProductSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-base-product-subscription-item-or-throw.util';
import { getCurrentLicensedBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-licensed-billing-subscription-item-or-throw.util';
import { getCurrentMeteredBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-metered-billing-subscription-item-or-throw.util';
import { getCurrentResourceCreditSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-resource-credit-subscription-item-or-throw.util';
import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FeatureFlagKey } from 'twenty-shared/types';

export type SubscriptionStripePrices = {
  licensedPriceId: string;
  seats: number;
  meteredPriceId: string | undefined;
  resourceCreditPriceId: string | undefined;
};

@Injectable()
export class BillingSubscriptionUpdateService {
  protected readonly logger = new Logger(BillingSubscriptionUpdateService.name);

  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly billingPriceService: BillingPriceService,
    private readonly billingProductService: BillingProductService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly billingSubscriptionPhaseService: BillingSubscriptionPhaseService,
    private readonly stripeBillingAlertService: StripeBillingAlertService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly meteredCreditService: MeteredCreditService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async isV2(workspaceId: string): Promise<boolean> {
    return await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_BILLING_V2_ENABLED,
      workspaceId,
    );
  }

  async changeMeteredPrice(
    workspaceId: string,
    meteredPriceId: string,
  ): Promise<void> {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    const subscriptionUpdate = {
      type: SubscriptionUpdateType.METERED_PRICE,
      newMeteredPriceId: meteredPriceId,
    } as const;

    await this.updateSubscription(billingSubscription.id, subscriptionUpdate);
  }

  async cancelSwitchMeteredPrice(workspace: WorkspaceEntity): Promise<void> {
    if (await this.isV2(workspace.id)) {
      return this.cancelSwitchResourceCreditPrice(workspace);
    }

    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    const currentMeteredPrice =
      getCurrentMeteredBillingSubscriptionItemOrThrow(billingSubscription);

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.METERED_PRICE,
      newMeteredPriceId: currentMeteredPrice.stripePriceId,
    });
  }

  async changeResourceCreditPrice(
    workspaceId: string,
    resourceCreditPriceId: string,
  ): Promise<void> {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );
    const subscriptionUpdate = {
      type: SubscriptionUpdateType.RESOURCE_CREDIT_PRICE,
      newResourceCreditPriceId: resourceCreditPriceId,
    } as const;

    await this.updateSubscription(billingSubscription.id, subscriptionUpdate);
  }

  async cancelSwitchResourceCreditPrice(
    workspace: WorkspaceEntity,
  ): Promise<void> {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    const currentResourceCreditPrice =
      getCurrentResourceCreditSubscriptionItemOrThrow(billingSubscription);
    const subscriptionUpdate = {
      type: SubscriptionUpdateType.RESOURCE_CREDIT_PRICE,
      newResourceCreditPriceId: currentResourceCreditPrice.stripePriceId,
    } as const;

    await this.updateSubscription(billingSubscription.id, subscriptionUpdate);
  }

  async cancelSwitchPlan(workspaceId: string) {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
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
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    const currentInterval = billingSubscription.interval;

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.INTERVAL,
      newInterval: currentInterval,
    });
  }

  async changeInterval(workspaceId: string) {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
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
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
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
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    await this.updateSubscription(billingSubscription.id, {
      type: SubscriptionUpdateType.SEATS,
      newSeats,
    });
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

    const isV2 = await this.isV2(subscription.workspaceId);

    const licensedItem = isV2
      ? getBaseProductSubscriptionItemOrThrow(subscription)
      : getCurrentLicensedBillingSubscriptionItemOrThrow(subscription);
    const resourceCreditItem = isV2
      ? getCurrentResourceCreditSubscriptionItemOrThrow(subscription)
      : undefined;

    const meteredItem = isV2
      ? undefined
      : getCurrentMeteredBillingSubscriptionItemOrThrow(subscription);
    const toUpdateCurrentPrices = await this.computeSubscriptionPricesUpdate(
      subscriptionUpdate,
      {
        licensedPriceId: licensedItem.stripePriceId,
        meteredPriceId: meteredItem?.stripePriceId,
        resourceCreditPriceId: resourceCreditItem?.stripePriceId,
        seats: licensedItem.quantity,
      },
      isV2,
    );

    const { schedule, currentPhase, nextPhase } =
      await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
        subscription.stripeSubscriptionId,
      );

    const shouldUpdateAtPeriodEnd =
      await this.shouldUpdateAtSubscriptionPeriodEnd(
        subscription,
        subscriptionUpdate,
      );

    if (shouldUpdateAtPeriodEnd) {
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
          isV2,
        });
      } else {
        assertIsDefinedOrThrow(nextPhase);
        assertIsDefinedOrThrow(currentPhase);

        const nextPhasePrices =
          await this.getSubscriptionPricesFromSchedulePhaseV2(nextPhase, isV2);

        const toUpdateNextPrices = await this.computeSubscriptionPricesUpdate(
          subscriptionUpdate,
          nextPhasePrices,
          isV2,
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
          isV2,
        });
      }
    } else {
      const subscriptionOptions =
        computeSubscriptionUpdateOptions(subscriptionUpdate);

      if (
        subscriptionUpdate.type === SubscriptionUpdateType.RESOURCE_CREDIT_PRICE
      ) {
        assertIsDefinedOrThrow(resourceCreditItem);
        await this.createResourceCreditUpgradeInvoice({
          subscription,
          currentResourceCreditPriceId: resourceCreditItem.stripePriceId,
          newResourceCreditPriceId: subscriptionUpdate.newResourceCreditPriceId,
        });
      }

      await this.runSubscriptionUpdate({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        licensedStripeItemId: licensedItem.stripeSubscriptionItemId,
        meteredStripeItemId: meteredItem?.stripeSubscriptionItemId,
        resourceCreditStripeItemId:
          resourceCreditItem?.stripeSubscriptionItemId,
        licensedStripePriceId: toUpdateCurrentPrices.licensedPriceId,
        meteredStripePriceId: toUpdateCurrentPrices?.meteredPriceId,
        resourceCreditStripePriceId:
          toUpdateCurrentPrices?.resourceCreditPriceId,
        seats: toUpdateCurrentPrices.seats,
        ...subscriptionOptions,
        isV2,
      });

      if (subscriptionUpdate.type !== SubscriptionUpdateType.SEATS) {
        await this.billingSubscriptionItemRepository.update(
          { stripeSubscriptionId: subscription.stripeSubscriptionId },
          { hasReachedCurrentPeriodCap: false },
        );
      }

      if (isDefined(nextPhase)) {
        assertIsDefinedOrThrow(schedule);
        const { currentPhase: refreshedCurrentPhase } =
          await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
            subscription.stripeSubscriptionId,
          );

        assertIsDefinedOrThrow(refreshedCurrentPhase);

        const nextPhasePrices =
          await this.getSubscriptionPricesFromSchedulePhaseV2(nextPhase, isV2);
        const toUpdateNextPrices = await this.computeSubscriptionPricesUpdate(
          subscriptionUpdate,
          nextPhasePrices,
          isV2,
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
          isV2,
        });
      }
    }

    await this.billingSubscriptionService.syncSubscriptionToDatabase(
      subscription.workspaceId,
      subscription.stripeSubscriptionId,
    );
  }

  private async createResourceCreditUpgradeInvoice({
    subscription,
    currentResourceCreditPriceId,
    newResourceCreditPriceId,
  }: {
    subscription: BillingSubscriptionEntity;
    currentResourceCreditPriceId: string;
    newResourceCreditPriceId: string;
  }): Promise<void> {
    const prices = await this.billingPriceRepository.find({
      where: {
        stripePriceId: In([
          currentResourceCreditPriceId,
          newResourceCreditPriceId,
        ]),
      },
    });

    const currentPrice = prices.find(
      (price) => price.stripePriceId === currentResourceCreditPriceId,
    );
    const newPrice = prices.find(
      (price) => price.stripePriceId === newResourceCreditPriceId,
    );

    assertIsDefinedOrThrow(currentPrice);
    assertIsDefinedOrThrow(newPrice);

    const diffInCents =
      Number(newPrice.unitAmount) - Number(currentPrice.unitAmount);

    if (diffInCents > 0) {
      await this.stripeInvoiceService.createImmediateUpgradeInvoice({
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        diffAmountInCents: diffInCents,
        description: `Resource usage - Upgrade resource credit price from $${Number(currentPrice.unitAmount) / 100} to $${Number(newPrice.unitAmount) / 100}`,
        currency: newPrice.currency,
      });
    }
  }

  private async getSubscriptionPricesFromSchedulePhaseV2(
    phase: Stripe.SubscriptionSchedule.Phase,
    isV2: boolean,
  ): Promise<SubscriptionStripePrices> {
    const licensedItemPriceIds = phase.items
      .filter((item) => item.quantity != null)
      .map((item) => normalizePriceRef(item.price));

    const licensedItemPrices = await this.billingPriceRepository.find({
      where: { stripePriceId: In(licensedItemPriceIds) },
      relations: ['billingProduct'],
    });

    const basePlanPrice = licensedItemPrices.find(
      (price) =>
        price.billingProduct?.metadata?.productKey ===
        BillingProductKey.BASE_PRODUCT,
    );

    assertIsDefinedOrThrow(basePlanPrice);

    const basePlanPhaseItem = findOrThrow(
      phase.items,
      (item) => normalizePriceRef(item.price) === basePlanPrice.stripePriceId,
    );

    assertIsDefinedOrThrow(basePlanPhaseItem.quantity);

    if (isV2) {
      const resourceCreditPrice = licensedItemPrices.find(
        (price) =>
          price.billingProduct?.metadata?.productKey ===
          BillingProductKey.RESOURCE_CREDIT,
      );

      assertIsDefinedOrThrow(resourceCreditPrice);

      return {
        licensedPriceId: basePlanPrice.stripePriceId,
        meteredPriceId: undefined,
        seats: basePlanPhaseItem.quantity,
        resourceCreditPriceId: resourceCreditPrice.stripePriceId,
      };
    } else {
      const meteredItem = findOrThrow(
        phase.items,
        (item) => item.quantity == null,
      );

      return {
        licensedPriceId: basePlanPrice.stripePriceId,
        meteredPriceId: normalizePriceRef(meteredItem.price),
        seats: basePlanPhaseItem.quantity,
        resourceCreditPriceId: undefined,
      };
    }
  }

  private async runSubscriptionUpdate({
    stripeSubscriptionId,
    licensedStripeItemId,
    meteredStripeItemId,
    resourceCreditStripeItemId,
    licensedStripePriceId,
    meteredStripePriceId,
    resourceCreditStripePriceId,
    seats,
    anchor,
    proration,
    metadata,
    isV2,
  }: {
    stripeSubscriptionId: string;
    licensedStripeItemId: string;
    meteredStripeItemId: string | undefined;
    resourceCreditStripeItemId: string | undefined;
    licensedStripePriceId: string;
    meteredStripePriceId: string | undefined;
    resourceCreditStripePriceId: string | undefined;
    seats: number;
    anchor?: Stripe.SubscriptionUpdateParams.BillingCycleAnchor;
    proration?: Stripe.SubscriptionUpdateParams.ProrationBehavior;
    metadata?: Record<string, string>;
    isV2: boolean;
  }) {
    if (isV2) {
      assertIsDefinedOrThrow(resourceCreditStripePriceId);
      assertIsDefinedOrThrow(resourceCreditStripeItemId);
      return await this.stripeSubscriptionService.updateSubscription(
        stripeSubscriptionId,
        {
          items: [
            {
              id: licensedStripeItemId,
              price: licensedStripePriceId,
              quantity: seats,
            },
            {
              id: resourceCreditStripeItemId,
              price: resourceCreditStripePriceId,
              quantity: 1,
            },
          ],
          ...(anchor ? { billing_cycle_anchor: anchor } : {}),
          ...(proration ? { proration_behavior: proration } : {}),
          ...(metadata ? { metadata } : {}),
        },
      );
    } else {
      assertIsDefinedOrThrow(meteredStripePriceId);
      assertIsDefinedOrThrow(meteredStripeItemId);
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
  }

  async runSubscriptionScheduleUpdate({
    stripeScheduleId,
    toUpdateNextPrices,
    toUpdateCurrentPrices,
    currentPhase,
    subscriptionCurrentPeriodEnd,
    isV2,
  }: {
    stripeScheduleId: string;
    toUpdateNextPrices: SubscriptionStripePrices;
    toUpdateCurrentPrices: SubscriptionStripePrices | undefined;
    currentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
    subscriptionCurrentPeriodEnd: number;
    isV2: boolean;
  }) {
    let toUpdateCurrentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase = {
      ...currentPhase,
      end_date: subscriptionCurrentPeriodEnd,
    };

    if (isDefined(toUpdateCurrentPrices)) {
      toUpdateCurrentPhase =
        await this.billingSubscriptionPhaseService.buildPhaseUpdateParams({
          toUpdatePrices: toUpdateCurrentPrices,
          endDate: subscriptionCurrentPeriodEnd,
          startDate: currentPhase.start_date,
          isV2,
        });
    }

    const toUpdateNextPhase =
      await this.billingSubscriptionPhaseService.buildPhaseUpdateParams({
        toUpdatePrices: toUpdateNextPrices,
        startDate: subscriptionCurrentPeriodEnd,
        endDate: undefined,
        isV2,
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

  async shouldUpdateAtSubscriptionPeriodEnd(
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
      case SubscriptionUpdateType.RESOURCE_CREDIT_PRICE: {
        const currentResourceCreditPriceId =
          subscription.billingSubscriptionItems.find(
            (item) =>
              item.billingProduct?.metadata.productKey ===
              BillingProductKey.RESOURCE_CREDIT,
          )?.stripePriceId;

        assertIsDefinedOrThrow(currentResourceCreditPriceId);
        const currentResourceCreditPrice =
          await this.billingPriceRepository.findOneOrFail({
            where: { stripePriceId: currentResourceCreditPriceId },
            relations: ['billingProduct'],
          });
        const newResourceCreditPrice =
          await this.billingPriceRepository.findOneOrFail({
            where: { stripePriceId: update.newResourceCreditPriceId },
            relations: ['billingProduct'],
          });

        billingValidator.assertIsLicensedResourceCreditPrice(
          currentResourceCreditPrice,
        );
        billingValidator.assertIsLicensedResourceCreditPrice(
          newResourceCreditPrice,
        );

        const currentResourceCreditCap = Number(
          currentResourceCreditPrice.metadata?.credit_amount,
        );
        const newResourceCreditCap = Number(
          newResourceCreditPrice.metadata?.credit_amount,
        );

        const isDowngrade = currentResourceCreditCap > newResourceCreditCap;

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
    isV2: boolean,
  ): Promise<SubscriptionStripePrices> {
    switch (update.type) {
      case SubscriptionUpdateType.PLAN:
        return await this.computeSubscriptionPricesUpdateByPlan(
          update.newPlan,
          currentPrices,
          isV2,
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
          isV2,
        );
      case SubscriptionUpdateType.RESOURCE_CREDIT_PRICE:
        return await this.computeSubscriptionPricesUpdateByResourceCreditPrice(
          update.newResourceCreditPriceId,
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
  private async computeSubscriptionPricesUpdateByResourceCreditPrice(
    newResourceCreditPriceId: string,
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

    const newResourceCreditPrice =
      await this.billingPriceRepository.findOneOrFail({
        where: { stripePriceId: newResourceCreditPriceId },
        relations: ['billingProduct'],
      });

    billingValidator.assertIsLicensedResourceCreditPrice(
      newResourceCreditPrice,
    );

    const newInterval = newResourceCreditPrice.interval;
    const newPlanKey = newResourceCreditPrice.billingProduct?.metadata.planKey;

    if (newInterval === currentInterval && currentPlanKey === newPlanKey) {
      return {
        ...currentPrices,
        resourceCreditPriceId: newResourceCreditPriceId,
      };
    }

    const newEquivalentResourceCreditPrice =
      await this.billingPriceService.findEquivalentResourceCreditPrice({
        referencePrice: newResourceCreditPrice,
        targetInterval: currentInterval,
        targetPlanKey: currentPlanKey,
        hasSameInterval: newInterval === currentInterval,
        hasSamePlanKey: currentPlanKey === newPlanKey,
      });

    return {
      ...currentPrices,
      resourceCreditPriceId: newEquivalentResourceCreditPrice.stripePriceId,
    };
  }

  private async computeSubscriptionPricesUpdateByPlan(
    newPlan: BillingPlanKey,
    currentPrices: SubscriptionStripePrices,
    isV2: boolean,
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

    if (isV2) {
      const currentResourceCreditPrice =
        await this.billingPriceRepository.findOneOrFail({
          where: { stripePriceId: currentPrices.resourceCreditPriceId },
          relations: ['billingProduct'],
        });

      billingValidator.assertIsLicensedResourceCreditPrice(
        currentResourceCreditPrice,
      );

      const targetResourceCreditPrice =
        await this.billingPriceService.findEquivalentResourceCreditPrice({
          referencePrice: currentResourceCreditPrice,
          targetInterval: currentInterval,
          targetPlanKey: newPlan,
          hasSameInterval: true,
          hasSamePlanKey: false,
        });

      return {
        ...currentPrices,
        licensedPriceId: targetLicensedPrice.stripePriceId,
        resourceCreditPriceId: targetResourceCreditPrice.stripePriceId,
      };
    } else {
      const currentMeteredPrice =
        await this.billingPriceRepository.findOneOrFail({
          where: { stripePriceId: currentPrices.meteredPriceId },
          relations: ['billingProduct'],
        });

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
  }

  private async computeSubscriptionPricesUpdateByInterval(
    newInterval: SubscriptionInterval,
    currentPrices: SubscriptionStripePrices,
    isV2: boolean,
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

    if (isV2) {
      const currentResourceCreditPrice =
        await this.billingPriceRepository.findOneOrFail({
          where: { stripePriceId: currentPrices.resourceCreditPriceId },
          relations: ['billingProduct'],
        });

      billingValidator.assertIsLicensedResourceCreditPrice(
        currentResourceCreditPrice,
      );

      const targetResourceCreditPrice =
        await this.billingPriceService.findEquivalentResourceCreditPrice({
          referencePrice: currentResourceCreditPrice,
          targetInterval: newInterval,
          targetPlanKey: currentPlanKey,
          hasSameInterval: false,
          hasSamePlanKey: true,
        });

      return {
        ...currentPrices,
        licensedPriceId: targetLicensedPrice.stripePriceId,
        resourceCreditPriceId: targetResourceCreditPrice.stripePriceId,
      };
    } else {
      const currentMeteredPrice =
        await this.billingPriceRepository.findOneOrFail({
          where: { stripePriceId: currentPrices.meteredPriceId },
          relations: ['billingProduct'],
        });

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
}
