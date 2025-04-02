import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JsonContains, Repository } from 'typeorm';

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@Injectable()
export class BillingSubscriptionItemService {
  protected readonly logger = new Logger(BillingSubscriptionItemService.name);
  constructor(
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
  ) {}

  async createPreliminarySubscriptionItemsForMeteredProducts(
    billingSubscription: BillingSubscription,
  ) {
    const meteredProducts = await this.billingProductRepository.find({
      where: {
        active: true,
        metadata: JsonContains({
          priceUsageBased: BillingUsageType.METERED,
        }),
      },
      relations: ['billingPrices'],
    });

    await this.billingSubscriptionItemRepository.upsert(
      meteredProducts.map((product) => ({
        billingSubscriptionId: billingSubscription.id,
        stripeSubscriptionId: billingSubscription.stripeSubscriptionId,
        stripeProductId: product.stripeProductId,
        stripePriceId: product.billingPrices.find((price) => price.active)
          ?.stripePriceId,
        billingSubscription,
      })),
      {
        conflictPaths: ['billingSubscriptionId', 'stripeProductId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
