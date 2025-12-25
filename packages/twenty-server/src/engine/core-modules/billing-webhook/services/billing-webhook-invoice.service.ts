import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  protected readonly logger = new Logger(BillingWebhookInvoiceService.name);
  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async processStripeEvent(data: Stripe.InvoiceFinalizedEvent.Data) {
    const {
      billing_reason: billingReason,
      subscription,
      customer,
    } = data.object;

    const stripeSubscriptionId = subscription as string | undefined;
    const stripeCustomerId = customer as string | undefined;

    if (
      isDefined(stripeSubscriptionId) &&
      billingReason === SUBSCRIPTION_CYCLE_BILLING_REASON
    ) {
      await this.billingSubscriptionItemRepository.update(
        { stripeSubscriptionId },
        { hasReachedCurrentPeriodCap: false },
      );

      if (isDefined(stripeCustomerId)) {
        await this.billingSubscriptionService.createBillingAlertForCustomer(
          stripeCustomerId,
        );
      }
    }
  }
}
