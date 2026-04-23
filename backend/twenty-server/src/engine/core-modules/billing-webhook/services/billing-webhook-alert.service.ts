/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';

@Injectable()
export class BillingWebhookAlertService {
  protected readonly logger = new Logger(BillingWebhookAlertService.name);
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
  ) {}

  async processStripeEvent(data: Stripe.BillingAlertTriggeredEvent.Data) {
    const { customer: stripeCustomerId, alert } = data.object;

    const stripeMeterId = alert.usage_threshold?.meter;

    assertIsDefinedOrThrow(stripeMeterId);

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
