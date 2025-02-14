/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class StripeBillingMeterEventService {
  protected readonly logger = new Logger(StripeBillingMeterEventService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.environmentService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async sendBillingMeterEvent({
    eventName,
    value,
    stripeCustomerId,
  }: {
    eventName: BillingMeterEventName;
    value: number;
    stripeCustomerId: string;
  }) {
    await this.stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        value: value.toString(),
        stripe_customer_id: stripeCustomerId,
      },
    });
  }
}
