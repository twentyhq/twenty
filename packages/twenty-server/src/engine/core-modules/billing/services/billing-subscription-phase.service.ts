/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';

@Injectable()
export class BillingSubscriptionPhaseService {
  constructor(
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
  ) {}

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

  async getProductKeyByPriceId(
    stripePriceIds: string[],
  ): Promise<Map<string, BillingProductKey>> {
    if (stripePriceIds.length === 0) {
      return new Map();
    }

    const prices = await this.billingPriceRepository.find({
      where: { stripePriceId: In(stripePriceIds) },
      relations: ['billingProduct'],
    });

    return new Map(
      prices.flatMap((price) => {
        const productKey = price.billingProduct?.metadata?.productKey;

        return isDefined(productKey)
          ? [[price.stripePriceId, productKey] as const]
          : [];
      }),
    );
  }
}
