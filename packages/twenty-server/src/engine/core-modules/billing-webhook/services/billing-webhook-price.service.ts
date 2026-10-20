/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import { transformStripePriceEventToDatabasePrice } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-price-event-to-database-price.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';

@Injectable()
export class BillingWebhookPriceService {
  protected readonly logger = new Logger(BillingWebhookPriceService.name);
  constructor(
    private readonly stripePriceService: StripePriceService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
  ) {}

  async processStripeEvent(
    data: Stripe.PriceCreatedEvent.Data | Stripe.PriceUpdatedEvent.Data,
  ) {
    const stripeProductId = String(data.object.product);
    const product = await this.billingProductRepository.findOne({
      where: { stripeProductId },
    });

    if (!product) {
      throw new BillingException(
        'Billing product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    await this.billingPriceRepository.upsert(
      transformStripePriceEventToDatabasePrice(
        await this.stripePriceService.getPriceByPriceId(data.object.id),
      ),
      {
        conflictPaths: ['stripePriceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return {
      stripePriceId: data.object.id,
    };
  }
}
