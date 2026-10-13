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
import {
  FlushCurrentBillingSubscriptionForPriceJob,
  type FlushCurrentBillingSubscriptionForPriceJobData,
} from 'src/engine/core-modules/billing/jobs/flush-current-billing-subscription-for-price.job';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';
import { hasPriceCreditMetadataChanged } from 'src/engine/core-modules/billing/utils/has-price-credit-metadata-changed.util';
import { transformStripeMeterToDatabaseMeter } from 'src/engine/core-modules/billing/utils/transform-stripe-meter-to-database-meter.util';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

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
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
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

    const price = transformStripePriceEventToDatabasePrice(
      await this.stripePriceService.getPriceByPriceId(data.object.id),
    );

    const storedPrice = await this.billingPriceRepository.findOne({
      where: { stripePriceId: price.stripePriceId },
    });

    await this.billingPriceRepository.upsert(price, {
      conflictPaths: ['stripePriceId'],
      skipUpdateIfNoValuesChanged: true,
    });

    if (
      hasPriceCreditMetadataChanged({
        previousMetadata: storedPrice?.metadata,
        nextMetadata: price.metadata,
      })
    ) {
      await this.enqueueCurrentBillingSubscriptionFlush(price.stripePriceId);
    }

    return {
      stripePriceId: data.object.id,
      stripeMeterId: meterId,
    };
  }

  private async enqueueCurrentBillingSubscriptionFlush(
    stripePriceId: string,
  ): Promise<void> {
    try {
      await this.messageQueueService.add<FlushCurrentBillingSubscriptionForPriceJobData>(
        FlushCurrentBillingSubscriptionForPriceJob.name,
        { stripePriceId },
      );
    } catch (error) {
      // Failing the webhook would not help: its retry compares against the price already stored and sees no change
      this.logger.warn(
        `Could not enqueue the currentBillingSubscription flush for price ${stripePriceId}, flushing inline: ${error}`,
      );
      await this.billingSubscriptionItemService.flushCurrentBillingSubscriptionForPrice(
        stripePriceId,
      );
    }
  }
}
