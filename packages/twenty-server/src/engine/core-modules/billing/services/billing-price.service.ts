/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';

@Injectable()
export class BillingPriceService {
  protected readonly logger = new Logger(BillingPriceService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    private readonly billingProductService: BillingProductService,
  ) {}

  async getBillingThresholdsByMeterPriceId(meterPriceId: string) {
    const price = await this.billingPriceRepository.findOneOrFail({
      where: {
        stripePriceId: meterPriceId,
      },
      relations: ['billingProduct'],
    });

    billingValidator.assertIsMeteredPrice(price);

    return this.stripeSubscriptionService.getBillingThresholds(
      price.tiers[0].flat_amount,
    );
  }

  async findEquivalentMeteredPrice({
    meteredPrice,
    targetInterval,
    targetPlanKey,
    hasSameInterval,
    hasSamePlanKey,
  }: {
    meteredPrice: BillingMeterPrice;
    targetInterval: SubscriptionInterval;
    targetPlanKey: BillingPlanKey;
    hasSameInterval: boolean;
    hasSamePlanKey: boolean;
  }) {
    if (hasSameInterval && hasSamePlanKey) {
      return meteredPrice;
    }

    const billingPricesPerPlanAndIntervalArray =
      await this.billingProductService.getProductPrices({
        interval: targetInterval,
        planKey: targetPlanKey,
      });

    const targetMeteredPrice = await this.findMeteredMatchFloor(
      billingPricesPerPlanAndIntervalArray,
      meteredPrice,
      targetInterval !== meteredPrice.interval ? targetInterval : undefined,
    );

    return targetMeteredPrice;
  }

  private async findMeteredMatchFloor(
    catalog: BillingPriceEntity[],
    reference: BillingMeterPrice,
    targetInterval: SubscriptionInterval | undefined,
  ): Promise<BillingMeterPrice> {
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
    catalog: BillingPriceEntity[],
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
}
