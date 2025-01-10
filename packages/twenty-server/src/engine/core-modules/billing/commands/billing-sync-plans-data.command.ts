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
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
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
  private readonly batchSize = 5;
  constructor(
    @InjectRepository(BillingPrice, 'core')
    private readonly billingPriceRepository: Repository<BillingPrice>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
    @InjectRepository(BillingMeter, 'core')
    private readonly billingMeterRepository: Repository<BillingMeter>,
    private readonly stripeBillingMeterService: StripeBillingMeterService,
    private readonly stripeProductService: StripeProductService,
    private readonly stripePriceService: StripePriceService,
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

  private async getBillingPrices(
    products: Stripe.Product[],
    options: BaseCommandOptions,
  ): Promise<Stripe.Price[][]> {
    return await Promise.all(
      products.map(async (product) => {
        if (!isStripeValidProductMetadata(product.metadata)) {
          this.logger.log(
            `Product: ${product.id} purposefully not inserted, invalid metadata format: ${JSON.stringify(
              product.metadata,
            )}`,
          );

          return [];
        }
        await this.upsertProductRepositoryData(product, options);

        const prices = await this.stripePriceService.getPricesByProductId(
          product.id,
        );

        this.logger.log(
          `${prices.length} prices found for product: ${product.id}`,
        );

        return prices;
      }),
    );
  }

  private async processBillingPricesByProductBatches(
    products: Stripe.Product[],
    options: BaseCommandOptions,
  ) {
    const prices: Stripe.Price[][] = [];

    for (let start = 0; start < products.length; start += this.batchSize) {
      const end =
        start + this.batchSize > products.length
          ? products.length
          : start + this.batchSize;

      const batch = products.slice(start, end);
      const batchPrices = await this.getBillingPrices(batch, options);

      prices.push(...batchPrices);
      this.logger.log(
        `Processed batch ${start / this.batchSize + 1} of products`,
      );
    }

    return prices;
  }

  override async executeBaseCommand(
    passedParams: string[],
    options: BaseCommandOptions,
  ): Promise<void> {
    const billingMeters = await this.stripeBillingMeterService.getAllMeters();

    await this.upsertMetersRepositoryData(billingMeters, options);

    const billingProducts = await this.stripeProductService.getAllProducts();

    const billingPrices = await this.processBillingPricesByProductBatches(
      billingProducts,
      options,
    );
    const transformedPrices = billingPrices.flatMap((prices) =>
      prices.map((price) =>
        transformStripePriceDataToPriceRepositoryData(price),
      ),
    );

    this.logger.log(`Upserting ${transformedPrices.length} transformed prices`);

    if (!options.dryRun) {
      await this.billingPriceRepository.upsert(transformedPrices, {
        conflictPaths: ['stripePriceId'],
      });
    }
  }
}
