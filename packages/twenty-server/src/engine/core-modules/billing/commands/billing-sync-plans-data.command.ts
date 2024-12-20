import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

import {
  BaseCommandOptions,
  BaseCommandRunner,
} from 'src/database/commands/base.command';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { isStripeValidProductMetadata } from 'src/engine/core-modules/billing/utils/is-stripe-valid-product-metadata.util';
import { transformStripeMeterDataToMeterRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-meter-data-to-meter-repository-data.util';
import { transformStripePriceDataToPriceRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-price-data-to-price-repository-data.util';
import { transformStripeProductDataToProductRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-product-data-to-product-repository-data.util';
@Command({
  name: 'billing:sync-plans-data',
  description:
    'Fetches from stripe the plans data (meter, product and price) and upserts it into the database',
})
export class BillingSyncPlansDataCommand extends BaseCommandRunner {
  constructor(
    @InjectRepository(BillingPrice, 'core')
    private readonly billingPriceRepository: Repository<BillingPrice>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
    @InjectRepository(BillingMeter, 'core')
    private readonly billingMeterRepository: Repository<BillingMeter>,
    private readonly stripeService: StripeService,
  ) {
    super();
  }

  private async upsertMetersRepositoryData(
    meters: Stripe.Billing.Meter[],
    options: BaseCommandOptions,
  ) {
    meters.map(async (meter) => {
      try {
        if (!options.dryRun) {
          await this.billingMeterRepository.upsert(
            transformStripeMeterDataToMeterRepositoryData(meter),
            {
              conflictPaths: ['stripeMeterId'],
            },
          );
        }
        this.logger.log(`Upserted meter: ${meter.id}`);
      } catch (error) {
        this.logger.error(`Error upserting meter ${meter.id}: ${error}`);
      }
    });
  }

  private async upsertProductRepositoryData(
    product: Stripe.Product,
    options: BaseCommandOptions,
  ) {
    try {
      if (!options.dryRun) {
        await this.billingProductRepository.upsert(
          transformStripeProductDataToProductRepositoryData(product),
          {
            conflictPaths: ['stripeProductId'],
          },
        );
      }
      this.logger.log(`Upserted product: ${product.id}`);
    } catch (error) {
      this.logger.error(`Error upserting product ${product.id}: ${error}`);
    }
  }

  override async executeBaseCommand(
    passedParams: string[],
    options: BaseCommandOptions,
  ): Promise<void> {
    const billingMeters = await this.stripeService.getAllMeters();

    await this.upsertMetersRepositoryData(billingMeters, options);

    const billingProducts = await this.stripeService.getAllProducts();

    const billingProductsIds = await Promise.all(
      billingProducts.map(async (product) => {
        if (isStripeValidProductMetadata(product.metadata)) {
          await this.upsertProductRepositoryData(product, options);

          return product.id;
        } else {
          this.logger.log(
            `Product: ${product.id} purposefully not inserted, invalid metadata format: ${JSON.stringify(
              product.metadata,
            )}`,
          );
        }
      }),
    );

    const billingPrices = await Promise.all(
      billingProductsIds.map(async (productId) => {
        if (productId) {
          const prices =
            await this.stripeService.getPricesByProductId(productId);

          this.logger.log(
            `${prices.length} prices found for product: ${productId}`,
          );

          return prices;
        }

        return [];
      }),
    );

    const transformedPrices = billingPrices
      .flat()
      .map((price) => transformStripePriceDataToPriceRepositoryData(price));

    this.logger.log(`Upserting ${transformedPrices.length} transformed prices`);

    if (!options.dryRun) {
      await this.billingPriceRepository.upsert(transformedPrices, {
        conflictPaths: ['stripePriceId'],
      });
    }
  }
}
