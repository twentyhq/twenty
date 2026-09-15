/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  assertIsDefinedOrThrow,
  findOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { type BillingSubscriptionSchedulePhaseDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { SubscriptionStripePrices } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';

@Injectable()
export class BillingSubscriptionPhaseService {
  constructor(
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingPriceService: BillingPriceService,
  ) {}

  async getDetailsFromPhase(phase: BillingSubscriptionSchedulePhaseDTO) {
    const meteredPrice = await this.billingPriceRepository.findOneOrFail({
      where: {
        stripePriceId: findOrThrow(
          phase.items,
          ({ quantity }) => !isDefined(quantity),
        ).price,
      },
    });

    const { quantity, price: licensedItemPriceId } = findOrThrow(
      phase.items,
      ({ quantity }) => isDefined(quantity),
    );

    const licensedPrice = await this.billingPriceRepository.findOneOrFail({
      where: {
        stripePriceId: licensedItemPriceId,
      },
    });

    const plan = await this.billingPlanService.getPlanByPriceId(
      meteredPrice.stripePriceId,
    );

    if (!isDefined(quantity)) {
      throw new Error('Quantity is not defined');
    }

    return {
      plan,
      meteredPrice,
      licensedPrice,
      quantity,
      interval: meteredPrice.interval,
    };
  }

  toPhaseUpdateParams(
    phase: Stripe.SubscriptionSchedule.Phase,
  ): Stripe.SubscriptionScheduleUpdateParams.Phase {
    return {
      start_date: phase.start_date,
      end_date: phase.end_date ?? undefined,
      items: (phase.items || []).map((it) => ({
        price: normalizePriceRef(it.price) as string,
        quantity: it.quantity ?? undefined,
      })),
      ...(phase.billing_thresholds
        ? { billing_thresholds: phase.billing_thresholds }
        : {}),
      proration_behavior: 'none',
    } as Stripe.SubscriptionScheduleUpdateParams.Phase;
  }

  buildPhaseUpdateParams({
    toUpdatePrices,
    startDate,
    endDate,
  }: {
    toUpdatePrices: SubscriptionStripePrices;
    startDate: Stripe.SubscriptionScheduleUpdateParams.Phase['start_date'];
    endDate: number | undefined;
  }): Stripe.SubscriptionScheduleUpdateParams.Phase {
    return {
      start_date: startDate,
      ...(endDate ? { end_date: endDate } : {}),
      proration_behavior: 'none',
      items: [
        {
          price: toUpdatePrices.licensedPriceId,
          quantity: toUpdatePrices.seats,
        },
        { price: toUpdatePrices.resourceCreditPriceId, quantity: 1 },
      ],
    };
  }

  getLicensedPriceIdAndQuantityFromPhaseUpdateParams(
    phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): { price: string; quantity: number } {
    const licensedItem = findOrThrow(phase.items!, (i) => i.quantity != null);

    assertIsDefinedOrThrow(licensedItem.price);
    assertIsDefinedOrThrow(licensedItem.quantity);

    return {
      price: licensedItem.price,
      quantity: licensedItem.quantity,
    };
  }

  async isSamePhaseSignature(
    a: Stripe.SubscriptionScheduleUpdateParams.Phase,
    b: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): Promise<boolean> {
    try {
      const phaseALicensedPriceIdAndQuantity =
        this.getLicensedPriceIdAndQuantityFromPhaseUpdateParams(a);
      const phaseBLicensedPriceIdAndQuantity =
        this.getLicensedPriceIdAndQuantityFromPhaseUpdateParams(b);
      const phaseAResourceCreditPriceId =
        this.getResourceCreditPriceIdFromPhaseUpdateParams(a);
      const phaseBResourceCreditPriceId =
        this.getResourceCreditPriceIdFromPhaseUpdateParams(b);

      return (
        phaseALicensedPriceIdAndQuantity.price ===
          phaseBLicensedPriceIdAndQuantity.price &&
        phaseALicensedPriceIdAndQuantity.quantity ===
          phaseBLicensedPriceIdAndQuantity.quantity &&
        phaseAResourceCreditPriceId === phaseBResourceCreditPriceId
      );
    } catch {
      return false;
    }
  }
  async buildResourceCreditPhaseUpdateParams({
    basePlanStripePriceId,
    seats,
    resourceCreditStripePriceId,
    startDate,
    endDate,
  }: {
    basePlanStripePriceId: string;
    seats: number;
    resourceCreditStripePriceId: string;
    startDate: Stripe.SubscriptionScheduleUpdateParams.Phase['start_date'];
    endDate: number | undefined;
  }): Promise<Stripe.SubscriptionScheduleUpdateParams.Phase> {
    return {
      start_date: startDate,
      ...(endDate ? { end_date: endDate } : {}),
      proration_behavior: 'none',
      items: [
        { price: basePlanStripePriceId, quantity: seats },
        { price: resourceCreditStripePriceId, quantity: 1 },
      ],
    };
  }

  // Billing V2: compares resource credit Stripe price id between phases
  async isSameResourceCreditPhaseSignature(
    a: Stripe.SubscriptionScheduleUpdateParams.Phase,
    b: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): Promise<boolean> {
    try {
      const phaseALicensedPriceIdAndQuantity =
        this.getLicensedPriceIdAndQuantityFromPhaseUpdateParams(a);
      const phaseBLicensedPriceIdAndQuantity =
        this.getLicensedPriceIdAndQuantityFromPhaseUpdateParams(b);
      const phaseAResourceCreditPriceId =
        this.getResourceCreditPriceIdFromPhaseUpdateParams(a);
      const phaseBResourceCreditPriceId =
        this.getResourceCreditPriceIdFromPhaseUpdateParams(b);

      return (
        phaseALicensedPriceIdAndQuantity.price ===
          phaseBLicensedPriceIdAndQuantity.price &&
        phaseALicensedPriceIdAndQuantity.quantity ===
          phaseBLicensedPriceIdAndQuantity.quantity &&
        phaseAResourceCreditPriceId === phaseBResourceCreditPriceId
      );
    } catch {
      return false;
    }
  }

  getResourceCreditPriceIdFromPhaseUpdateParams(
    phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): string {
    const items = phase.items ?? [];
    const licensedPriceIdAndQuantity =
      this.getLicensedPriceIdAndQuantityFromPhaseUpdateParams(phase);

    const resourceCreditItem = items.find(
      (item) =>
        item.price !== licensedPriceIdAndQuantity.price && item.quantity === 1,
    );

    if (!resourceCreditItem?.price) {
      throw new Error('Resource credit item not found in V2 phase params');
    }

    return resourceCreditItem.price;
  }
}
