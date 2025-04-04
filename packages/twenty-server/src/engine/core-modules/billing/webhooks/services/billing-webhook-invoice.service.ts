import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';

const SUBSCRIPTION_CYCLE_BILLING_REASON = 'subscription_cycle';

@Injectable()
export class BillingWebhookInvoiceService {
  protected readonly logger = new Logger(BillingWebhookInvoiceService.name);
  constructor(
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
  ) {}

  async processStripeEvent(data: Stripe.InvoiceFinalizedEvent.Data) {
    const { billing_reason: billingReason, subscription } = data.object;

    const stripeSubscriptionId = subscription as string | undefined;

    if (
      isDefined(stripeSubscriptionId) &&
      billingReason === SUBSCRIPTION_CYCLE_BILLING_REASON
    ) {
      await this.billingSubscriptionItemRepository.update(
        { stripeSubscriptionId },
        { hasReachedCurrentPeriodCap: false },
      );
    }
  }
}
