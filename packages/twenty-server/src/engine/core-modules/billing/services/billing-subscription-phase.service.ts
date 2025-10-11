/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  assertIsDefinedOrThrow,
  findOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import Stripe from 'stripe';

import { BillingSubscriptionSchedulePhase } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';

@Injectable()
export class BillingSubscriptionPhaseService {
  constructor(
    @InjectRepository(BillingPrice)
    private readonly billingPriceRepository: Repository<BillingPrice>,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingPriceService: BillingPriceService,
  ) {}

  async getDetailsFromPhase(phase: BillingSubscriptionSchedulePhase) {
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

  toSnapshot(
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

  async buildSnapshot(
    base: Stripe.SubscriptionScheduleUpdateParams.Phase,
    licensedPriceId: string,
    seats: number,
    meteredPriceId: string,
  ): Promise<Stripe.SubscriptionScheduleUpdateParams.Phase> {
    return {
      start_date: base.start_date,
      end_date: base.end_date,
      proration_behavior: base.proration_behavior ?? 'none',
      items: [
        { price: licensedPriceId, quantity: seats },
        { price: meteredPriceId },
      ],
      billing_thresholds:
        await this.billingPriceService.getBillingThresholdsByMeterPriceId(
          meteredPriceId,
        ),
    };
  }

  getLicensedPriceIdFromSnapshot(
    phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): string {
    const licensedItem = findOrThrow(phase.items!, (i) => i.quantity != null);

    assertIsDefinedOrThrow(licensedItem.price);

    return licensedItem.price;
  }

  async isSamePhaseSignature(
    a: Stripe.SubscriptionScheduleUpdateParams.Phase,
    b: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): Promise<boolean> {
    try {
      const sigA = await this.getPhaseSignatureFromSnapshot(a);
      const sigB = await this.getPhaseSignatureFromSnapshot(b);

      return (
        sigA.planKey === sigB.planKey &&
        sigA.interval === sigB.interval &&
        sigA.meteredPriceId === sigB.meteredPriceId
      );
    } catch {
      return false;
    }
  }

  private async getPhaseSignatureFromSnapshot(
    phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  ): Promise<{
    planKey: BillingPlanKey;
    interval: SubscriptionInterval;
    meteredPriceId: string;
  }> {
    const metered = findOrThrow(phase.items!, (i) => i.quantity == null);
    const meteredPriceId = metered.price;

    assertIsDefinedOrThrow(meteredPriceId);

    const meteredPrice = await this.billingPriceRepository.findOneOrFail({
      where: {
        stripePriceId: meteredPriceId,
      },
      relations: ['billingProduct'],
    });

    const plan = await this.billingPlanService.getPlanByPriceId(meteredPriceId);

    return {
      planKey: plan.planKey,
      interval: meteredPrice.interval,
      meteredPriceId,
    };
  }
}
