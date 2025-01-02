import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { Repository } from 'typeorm';

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { isStripeValidProductMetadata } from 'src/engine/core-modules/billing/utils/is-stripe-valid-product-metadata.util';
import { transformStripeProductEventToProductRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-product-event-to-product-repository-data.util';
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
          ...transformStripeProductEventToProductRepositoryData(data),
          metadata,
        }
      : transformStripeProductEventToProductRepositoryData(data);

    await this.billingProductRepository.upsert(productRepositoryData, {
      conflictPaths: ['stripeProductId'],
      skipUpdateIfNoValuesChanged: true,
    });

    return {
      stripeProductId: data.object.id,
    };
  }

  isStripeValidProductMetadata(
    metadata: Stripe.Metadata,
  ): metadata is BillingProductMetadata {
    if (Object.keys(metadata).length === 0) {
      return true;
    }
    const hasBillingPlanKey = this.isValidBillingPlanKey(metadata?.planKey);
    const hasPriceUsageBased = this.isValidPriceUsageBased(
      metadata?.priceUsageBased,
    );

    return hasBillingPlanKey && hasPriceUsageBased;
  }

  isValidBillingPlanKey(planKey?: string) {
    return Object.values(BillingPlanKey).includes(planKey as BillingPlanKey);
  }

  isValidPriceUsageBased(priceUsageBased?: string) {
    return Object.values(BillingUsageType).includes(
      priceUsageBased as BillingUsageType,
    );
  }
}
