/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';

@Injectable()
export class BillingPriceService {
  protected readonly logger = new Logger(BillingPriceService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    @InjectRepository(BillingPrice)
    private readonly billingPriceRepository: Repository<BillingPrice>,
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
}
