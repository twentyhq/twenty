import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ProductPriceEntity } from 'src/engine/core-modules/billing/dto/product-price.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
@Injectable()
export class BillingPlanService {
  protected readonly logger = new Logger(BillingPlanService.name);
  constructor(
    @InjectRepository(BillingPrice, 'core')
    private readonly billingPriceRepository: Repository<BillingPrice>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
  ) {}

  async getProductByPlan(
    planKey: BillingPlanKey,
    priceUsageBased: BillingUsageType,
  ): Promise<string> {
    const product = await this.billingProductRepository.findOneOrFail({
      where: {
        metadata: {
          planKey,
          priceUsageBased,
        },
        active: true,
      },
    });

    return product.stripeProductId;
  }

  async getProductPricesByPlan(
    planKey: BillingPlanKey,
    priceUsageBased: BillingUsageType,
  ): Promise<ProductPriceEntity[]> {
    const stripeProductId = await this.getProductByPlan(
      planKey,
      priceUsageBased,
    );

    const prices = await this.billingPriceRepository.find({
      where: { stripeProductId, active: true },
    });

    return this.formatBillingPriceDataToProductPriceEntity(prices);
  }

  async getProductPriceByPlanAndInterval(
    planKey: BillingPlanKey = BillingPlanKey.PRO,
    priceUsageBased: BillingUsageType,
    interval: string,
  ): Promise<ProductPriceEntity | undefined> {
    const prices = await this.getProductPricesByPlan(planKey, priceUsageBased);

    return prices.find((price) => price.recurringInterval === interval);
  }

  formatBillingPriceDataToProductPriceEntity(
    prices: BillingPrice[],
  ): ProductPriceEntity[] {
    const productPrices: ProductPriceEntity[] = Object.values(
      prices
        .filter((item) => item.recurring?.interval && item.unitAmount)
        .reduce((acc, item: BillingPrice) => {
          const interval = item.recurring?.interval;

          if (!interval || !item.unitAmount) {
            return acc;
          }

          if (!acc[interval] || item.createdAt > acc[interval].createdAt) {
            acc[interval] = {
              unitAmount: item.unitAmount,
              recurringInterval: interval,
              created: item.createdAt,
              stripePriceId: item.stripePriceId,
            };
          }

          return acc satisfies Record<string, ProductPriceEntity>;
        }, {}),
    );

    return productPrices.sort((a, b) => a.unitAmount - b.unitAmount); //refacto later
  }
}
