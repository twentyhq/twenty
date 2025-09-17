/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { validator } from 'src/utils/assert-is-defined';

@Injectable()
export class BillingWebhookAlertService {
  protected readonly logger = new Logger(BillingWebhookAlertService.name);
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectRepository(BillingProduct)
    private readonly billingProductRepository: Repository<BillingProduct>,
    @InjectRepository(BillingSubscriptionItem)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
  ) {}

  async processStripeEvent(data: Stripe.BillingAlertTriggeredEvent.Data) {
    const { customer: stripeCustomerId, alert } = data.object;

    const stripeMeterId = alert.usage_threshold?.meter;

    validator.assertIsDefined(stripeMeterId);

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { stripeCustomerId },
      );

    const product = await this.billingProductRepository.findOne({
      where: {
        billingPrices: {
          stripeMeterId:
            typeof stripeMeterId === 'string'
              ? stripeMeterId
              : stripeMeterId.id,
        },
      },
    });

    if (!product) {
      throw new BillingException(
        `Product associated to meter ${stripeMeterId} not found`,
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    await this.billingSubscriptionItemRepository.update(
      {
        billingSubscriptionId: subscription.id,
        stripeProductId: product.stripeProductId,
      },
      { hasReachedCurrentPeriodCap: true },
    );
  }
}
