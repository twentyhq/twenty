import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { transformStripeMeterDataToMeterRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-meter-data-to-meter-repository-data.util';
import { transformStripePriceEventToPriceRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-price-event-to-price-repository-data.util';
@Injectable()
export class BillingWebhookPriceService {
  protected readonly logger = new Logger(BillingWebhookPriceService.name);
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(BillingPrice, 'core')
    private readonly billingPriceRepository: Repository<BillingPrice>,
    @InjectRepository(BillingMeter, 'core')
    private readonly billingMeterRepository: Repository<BillingMeter>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
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
      const meterData = await this.stripeService.getMeter(meterId);

      await this.billingMeterRepository.upsert(
        transformStripeMeterDataToMeterRepositoryData(meterData),
        {
          conflictPaths: ['stripeMeterId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    }

    await this.billingPriceRepository.upsert(
      transformStripePriceEventToPriceRepositoryData(data),
      {
        conflictPaths: ['stripePriceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
