/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeBillingMeterEventService {
  protected readonly logger = new Logger(StripeBillingMeterEventService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
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

  async sumMeterEvents(
    stripeMeterId: string,
    stripeCustomerId: string,
    startTime: Date,
    endTime: Date,
  ) {
    const eventSummaries = await this.stripe.billing.meters.listEventSummaries(
      stripeMeterId,
      {
        customer: stripeCustomerId,
        start_time: Math.floor(startTime.getTime() / (1000 * 60)) * 60,
        end_time: Math.ceil(endTime.getTime() / (1000 * 60)) * 60,
      },
    );

    return eventSummaries.data.reduce((acc, eventSummary) => {
      return acc + eventSummary.aggregated_value;
    }, 0);
  }
}
