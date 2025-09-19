import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { StripeBillingMeterService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter.service';

@Injectable()
export class StripeBillingAlertService {
  protected readonly logger = new Logger(StripeBillingAlertService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
    private readonly stripeBillingMeterService: StripeBillingMeterService,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async createUsageThresholdAlertForCustomerMeter(
    customerId: string,
    gte: number,
  ): Promise<void> {
    const meters = await this.stripeBillingMeterService.getAllMeters();

    await this.stripe.billing.alerts.create({
      alert_type: 'usage_threshold',
      title: `Trial usage cap for customer ${customerId}`,
      usage_threshold: {
        gte,
        meter: meters[0].id,
        recurrence: 'one_time',
        filters: [
          {
            type: 'customer',
            customer: customerId,
          },
        ],
      },
    });
  }
}
