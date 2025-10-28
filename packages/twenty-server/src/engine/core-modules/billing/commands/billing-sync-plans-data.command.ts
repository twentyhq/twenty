/* @license Enterprise */

import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  type MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeProductService } from 'src/engine/core-modules/billing/stripe/services/stripe-product.service';
import { isStripeValidProductMetadata } from 'src/engine/core-modules/billing/utils/is-stripe-valid-product-metadata.util';
import { transformStripeMeterToDatabaseMeter } from 'src/engine/core-modules/billing/utils/transform-stripe-meter-to-database-meter.util';
import { transformStripePriceToDatabasePrice } from 'src/engine/core-modules/billing/utils/transform-stripe-price-to-database-price.util';
import { transformStripeProductToDatabaseProduct } from 'src/engine/core-modules/billing/utils/transform-stripe-product-to-database-product.util';
@Command({
  name: 'billing:sync-plans-data',
  description:
    'Fetches from stripe the plans data (meter, product and price) and upserts it into the database',
})
export class BillingSyncPlansDataCommand extends MigrationCommandRunner {
  private readonly batchSize = 5;
  constructor(
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
    @InjectRepository(BillingMeterEntity)
    private readonly billingMeterRepository: Repository<BillingMeterEntity>,
    private readonly stripeBillingMeterService: StripeBillingMeterService,
    private readonly stripeProductService: StripeProductService,
    private readonly stripePriceService: StripePriceService,
  ) {
    super();
  }

  private async upsertMetersRepositoryData(
    meters: Stripe.Billing.Meter[],
    options: MigrationCommandOptions,
  ) {
    meters.map(async (meter) => {
      try {
        if (!options.dryRun) {
          await this.billingMeterRepository.upsert(
            transformStripeMeterToDatabaseMeter(meter),
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
    options: MigrationCommandOptions,
  ) {
    try {
      if (!options.dryRun) {
        await this.billingProductRepository.upsert(
          transformStripeProductToDatabaseProduct(product),
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
    options: MigrationCommandOptions,
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
    options: MigrationCommandOptions,
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

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    const billingMeters = await this.stripeBillingMeterService.getAllMeters();

    await this.upsertMetersRepositoryData(billingMeters, options);

    const billingProducts = await this.stripeProductService.getAllProducts();

    const billingPrices = await this.processBillingPricesByProductBatches(
      billingProducts,
      options,
    );
    const transformedPrices = billingPrices.flatMap((prices) =>
      prices.map((price) => transformStripePriceToDatabasePrice(price)),
    );

    this.logger.log(`Upserting ${transformedPrices.length} transformed prices`);

    if (!options.dryRun) {
      await this.billingPriceRepository.upsert(transformedPrices, {
        conflictPaths: ['stripePriceId'],
      });
    }
  }
}
