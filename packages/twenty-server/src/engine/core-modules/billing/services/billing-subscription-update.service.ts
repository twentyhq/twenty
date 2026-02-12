/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  assertIsDefinedOrThrow,
  assertUnreachable,
  findOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

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
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import {
  type SubscriptionUpdate,
  SubscriptionUpdateType,
} from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { computeSubscriptionUpdateOptions } from 'src/engine/core-modules/billing/utils/compute-subscription-update-options.util';
import { getCurrentLicensedBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-licensed-billing-subscription-item-or-throw.util';
import { getCurrentMeteredBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-metered-billing-subscription-item-or-throw.util';
import { getSubscriptionPricesFromSchedulePhase } from 'src/engine/core-modules/billing/utils/get-subscription-prices-from-schedule-phase.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type SubscriptionStripePrices = {
  licensedPriceId: string;
  seats: number;
  meteredPriceId: string;
};

@Injectable()
export class BillingSubscriptionUpdateService {
  protected readonly logger = new Logger(BillingSubscriptionUpdateService.name);

  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
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
  ) {}

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

      if (subscriptionUpdate.type !== SubscriptionUpdateType.SEATS) {
        await this.billingSubscriptionItemRepository.update(
          { stripeSubscriptionId: subscription.stripeSubscriptionId },
          { hasReachedCurrentPeriodCap: false },
        );

        const meteredPricingInfo =
          await this.meteredCreditService.getMeteredPricingInfoFromPriceId(
            toUpdateCurrentPrices.meteredPriceId,
          );

        const creditBalance = await this.meteredCreditService.getCreditBalance(
          subscription.stripeCustomerId,
          meteredPricingInfo.unitPriceCents,
        );

        await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
          subscription.stripeCustomerId,
          meteredPricingInfo.tierCap,
          creditBalance,
          subscription.currentPeriodStart,
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

    await this.billingSubscriptionService.syncSubscriptionToDatabase(
      subscription.workspaceId,
      subscription.stripeSubscriptionId,
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
