/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

const TRIAL_PERIOD_ALERT_TITLE = 'TRIAL_PERIOD_ALERT'; // to set in Stripe config

@Injectable()
export class BillingWebhookAlertService {
  protected readonly logger = new Logger(BillingWebhookAlertService.name);
  constructor(
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
  ) {}

  async processStripeEvent(data: Stripe.BillingAlertTriggeredEvent.Data) {
    const { customer: stripeCustomerId, alert } = data.object;

    const stripeMeterId = alert.usage_threshold?.meter as string | undefined;

    if (alert.title === TRIAL_PERIOD_ALERT_TITLE && isDefined(stripeMeterId)) {
      const subscription = await this.billingSubscriptionRepository.findOne({
        where: { stripeCustomerId, status: SubscriptionStatus.Trialing },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
        ],
      });

      if (!subscription) return;

      const product = await this.billingProductRepository.findOne({
        where: {
          billingPrices: { stripeMeterId },
        },
      });

      if (!product) {
        throw new BillingException(
          `Product associated to meter ${stripeMeterId} not found`,
          BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
        );
      }

      const subscriptionItem = subscription.billingSubscriptionItems.find(
        (item) =>
          item.billingProduct.stripeProductId === product.stripeProductId,
      );

      const trialPeriodFreeWorkflowCredits = isDefined(
        subscriptionItem?.metadata.trialPeriodFreeWorkflowCredits,
      )
        ? Number(subscriptionItem?.metadata.trialPeriodFreeWorkflowCredits)
        : 0;

      if (
        !isDefined(alert.usage_threshold?.gte) ||
        trialPeriodFreeWorkflowCredits !== alert.usage_threshold.gte
      ) {
        return;
      }

      await this.billingSubscriptionItemRepository.update(
        {
          billingSubscriptionId: subscription.id,
          stripeProductId: product.stripeProductId,
        },
        { hasReachedCurrentPeriodCap: true },
      );
    }
  }
}
