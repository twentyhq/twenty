/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';

@Injectable()
export class BillingWebhookCreditGrantService {
  constructor(private readonly meteredCreditService: MeteredCreditService) {}

  async processStripeEvent(stripeCustomerId: string): Promise<void> {
    await this.meteredCreditService.recreateBillingAlertForCustomer(
      stripeCustomerId,
    );
  }
}
