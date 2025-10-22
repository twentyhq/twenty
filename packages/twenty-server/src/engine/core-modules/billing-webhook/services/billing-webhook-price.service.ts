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
import { BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { transformStripeMeterToDatabaseMeter } from 'src/engine/core-modules/billing/utils/transform-stripe-meter-to-database-meter.util';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';

@Injectable()
export class BillingWebhookPriceService {
  protected readonly logger = new Logger(BillingWebhookPriceService.name);
  constructor(
    private readonly stripeBillingMeterService: StripeBillingMeterService,
    private readonly stripePriceService: StripePriceService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectRepository(BillingMeterEntity)
    private readonly billingMeterRepository: Repository<BillingMeterEntity>,
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

    const meterId = data.object.recurring?.meter;

    if (meterId) {
      const meterData = await this.stripeBillingMeterService.getMeter(meterId);

      await this.billingMeterRepository.upsert(
        transformStripeMeterToDatabaseMeter(meterData),
        {
          conflictPaths: ['stripeMeterId'],
          skipUpdateIfNoValuesChanged: true,
        },
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
      stripeMeterId: meterId,
    };
  }
}
