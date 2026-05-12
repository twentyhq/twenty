/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { billingValidator } from 'src/engine/core-modules/billing/billing.validate';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

export type MeteredPricingInfo = {
  tierCap: number;
  unitPriceCents: number;
  stripeMeterId?: string;
};

export type ResourceCreditPricingInfo = {
  tierCap: number;
  unitPriceCents: number;
};

@Injectable()
export class MeteredCreditService {
  protected readonly logger = new Logger(MeteredCreditService.name);

  constructor(
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
    private readonly stripeBillingAlertService: StripeBillingAlertService,
    private readonly stripeCreditGrantService: StripeCreditGrantService,
  ) {}

  /**
   * Get metered pricing info for a subscription by looking up the metered subscription item
   * and extracting tier cap and unit price from the associated price.
   */
  async getMeteredPricingInfo(
    subscriptionId: string,
  ): Promise<MeteredPricingInfo | null> {
    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
        'billingSubscriptionItems.billingProduct.billingPrices',
      ],
    });

    if (!isDefined(subscription)) {
      return null;
    }

    return this.extractMeteredPricingInfoFromSubscription(subscription);
  }

  extractMeteredPricingInfoFromSubscription(
    subscription: BillingSubscriptionEntity,
  ): MeteredPricingInfo | null {
    const meteredItem = subscription.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct?.metadata?.productKey ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!isDefined(meteredItem)) {
      return null;
    }

    const matchingPrice = meteredItem.billingProduct.billingPrices?.find(
      (price) => price.stripePriceId === meteredItem.stripePriceId,
    );

    if (!isDefined(matchingPrice)) {
      return null;
    }

    if (!billingValidator.isMeteredTiersSchema(matchingPrice.tiers)) {
      return null;
    }

    return {
      tierCap: matchingPrice.tiers[0].up_to,
      unitPriceCents: Number(matchingPrice.tiers[1].unit_amount_decimal),
      stripeMeterId: matchingPrice.stripeMeterId ?? undefined,
    };
  }

  /**
   * Get metered pricing info directly from a price ID.
   */
  async getMeteredPricingInfoFromPriceId(
    priceId: string,
  ): Promise<MeteredPricingInfo> {
    const price = await this.billingPriceRepository.findOneOrFail({
      where: { stripePriceId: priceId },
    });

    billingValidator.assertIsMeteredTiersSchemaOrThrow(price.tiers);

    return {
      tierCap: price.tiers[0].up_to,
      unitPriceCents: Number(price.tiers[1].unit_amount_decimal),
      stripeMeterId: price.stripeMeterId ?? undefined,
    };
  }

  /**
   * Get metered rollover parameters for a subscription.
   * Returns null if no metered item is found.
   */
  async getMeteredRolloverParameters(subscriptionId: string): Promise<{
    stripeMeterId: string;
    tierQuantity: number;
    unitPriceCents: number;
  } | null> {
    const meteredDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscriptionId,
      );

    const meteredItem = meteredDetails.find(
      (item) => item.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!meteredItem) {
      return null;
    }

    return {
      stripeMeterId: meteredItem.stripeMeterId,
      tierQuantity: meteredItem.tierQuantity,
      unitPriceCents: meteredItem.unitPriceCents,
    };
  }

  /**
   * Recreate billing alert for a subscription. This archives existing alerts and creates
   * a new one with the correct threshold based on current pricing and credit balance.
   */
  async recreateBillingAlertForSubscription(
    subscription: BillingSubscriptionEntity,
    periodStart?: Date,
  ): Promise<void> {
    const meteredPricingInfo = await this.getMeteredPricingInfo(
      subscription.id,
    );

    if (!isDefined(meteredPricingInfo)) {
      this.logger.warn(
        `Cannot create billing alert: metered pricing info not found for subscription ${subscription.id}`,
      );

      return;
    }

    const creditBalance =
      await this.stripeCreditGrantService.getCustomerCreditBalance(
        subscription.stripeCustomerId,
        meteredPricingInfo.unitPriceCents,
      );

    // Use the subscription's current period start if not provided
    const effectivePeriodStart = periodStart ?? subscription.currentPeriodStart;

    await this.stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter(
      subscription.stripeCustomerId,
      meteredPricingInfo.tierCap,
      creditBalance,
      effectivePeriodStart,
    );
  }

  /**
   * Get credit balance for a customer in credit units (not monetary).
   */
  async getCreditBalance(
    stripeCustomerId: string,
    unitPriceCents: number,
  ): Promise<number> {
    return this.stripeCreditGrantService.getCustomerCreditBalance(
      stripeCustomerId,
      unitPriceCents,
    );
  }

  // V2 path — uses productKey === RESOURCE_CREDIT; derives cap from price.metadata.credit_amount
  extractResourceCreditPricingInfo(
    subscription: BillingSubscriptionEntity,
  ): ResourceCreditPricingInfo | null {
    const resourceCreditItem = subscription.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct?.metadata?.productKey ===
        BillingProductKey.RESOURCE_CREDIT,
    );

    if (!isDefined(resourceCreditItem)) {
      return null;
    }

    const matchingPrice =
      resourceCreditItem.billingProduct?.billingPrices?.find(
        (price) => price.stripePriceId === resourceCreditItem.stripePriceId,
      );

    if (!isDefined(matchingPrice)) {
      return null;
    }

    const tierCap = Number(matchingPrice.metadata?.credit_amount ?? 0);

    if (!Number.isFinite(tierCap) || tierCap <= 0) {
      return null;
    }

    return {
      tierCap,
      unitPriceCents: matchingPrice.unitAmount ?? 0,
    };
  }

  async getResourceCreditRolloverParameters(subscriptionId: string): Promise<{
    tierQuantity: number;
    unitPriceCents: number;
  } | null> {
    //TODO : To optimize once evaluateCapBatch is deprecated
    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
        'billingSubscriptionItems.billingProduct.billingPrices',
      ],
    });

    if (!isDefined(subscription)) {
      return null;
    }

    const pricingInfo = this.extractResourceCreditPricingInfo(subscription);

    if (!isDefined(pricingInfo)) {
      return null;
    }

    return {
      tierQuantity: pricingInfo.tierCap,
      unitPriceCents: pricingInfo.unitPriceCents,
    };
  }
}
