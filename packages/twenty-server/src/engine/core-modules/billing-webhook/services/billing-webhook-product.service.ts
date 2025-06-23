/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { Repository } from 'typeorm';

import { transformStripeProductEventToDatabaseProduct } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-product-event-to-database-product.util';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { isStripeValidProductMetadata } from 'src/engine/core-modules/billing/utils/is-stripe-valid-product-metadata.util';
@Injectable()
export class BillingWebhookProductService {
  protected readonly logger = new Logger(BillingWebhookProductService.name);
  constructor(
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
  ) {}

  async processStripeEvent(
    data: Stripe.ProductCreatedEvent.Data | Stripe.ProductUpdatedEvent.Data,
  ) {
    const metadata = data.object.metadata;
    const productRepositoryData = isStripeValidProductMetadata(metadata)
      ? {
          ...transformStripeProductEventToDatabaseProduct(data),
          metadata,
        }
      : transformStripeProductEventToDatabaseProduct(data);

    await this.billingProductRepository.upsert(productRepositoryData, {
      conflictPaths: ['stripeProductId'],
      skipUpdateIfNoValuesChanged: true,
    });

    return {
      stripeProductId: data.object.id,
    };
  }
}
