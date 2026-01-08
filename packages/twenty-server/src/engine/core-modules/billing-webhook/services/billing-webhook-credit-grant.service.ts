/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';

@Injectable()
export class BillingWebhookCreditGrantService {
  constructor(
    private readonly meteredCreditService: MeteredCreditService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async processStripeEvent(stripeCustomerId: string): Promise<void> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        stripeCustomerId,
      });

    if (!isDefined(subscription)) {
      return;
    }

    await this.meteredCreditService.recreateBillingAlertForSubscription(
      subscription,
    );
  }
}
