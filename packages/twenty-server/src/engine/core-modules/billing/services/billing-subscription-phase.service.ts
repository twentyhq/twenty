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

  async buildPhaseUpdateParams({
    licensedStripePriceId,
    seats,
    meteredStripePriceId,
    startDate,
    endDate,
  }: {
    licensedStripePriceId: string;
    seats: number;
    meteredStripePriceId: string;
    startDate: Stripe.SubscriptionScheduleUpdateParams.Phase['start_date'];
    endDate: number | undefined;
  }): Promise<Stripe.SubscriptionScheduleUpdateParams.Phase> {
    return {
      start_date: startDate,
      ...(endDate ? { end_date: endDate } : {}),
      proration_behavior: 'none',
      items: [
        { price: licensedStripePriceId, quantity: seats },
        { price: meteredStripePriceId },
      ],
      billing_thresholds:
        await this.billingPriceService.getBillingThresholdsByMeterPriceId(
          meteredStripePriceId,
        ),
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

  getMeteredPriceIdFromPhaseUpdateParams(
    phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): string {
    const meteredItem = findOrThrow(phase.items!, (i) => i.quantity == null);

    assertIsDefinedOrThrow(meteredItem.price);

    return meteredItem.price;
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
      const phaseAMeteredPriceId =
        this.getMeteredPriceIdFromPhaseUpdateParams(a);
      const phaseBMeteredPriceId =
        this.getMeteredPriceIdFromPhaseUpdateParams(b);

      return (
        phaseALicensedPriceIdAndQuantity.price ===
          phaseBLicensedPriceIdAndQuantity.price &&
        phaseALicensedPriceIdAndQuantity.quantity ===
          phaseBLicensedPriceIdAndQuantity.quantity &&
        phaseAMeteredPriceId === phaseBMeteredPriceId
      );
    } catch {
      return false;
    }
  }
}
