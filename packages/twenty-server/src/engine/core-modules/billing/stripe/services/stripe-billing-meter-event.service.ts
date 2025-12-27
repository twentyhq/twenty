/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { type BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { type BillingDimensions } from 'src/engine/core-modules/billing/types/billing-dimensions.type';
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
    dimensions,
  }: {
    eventName: BillingMeterEventName;
    value: number;
    stripeCustomerId: string;
    dimensions?: BillingDimensions;
  }) {
    const payload: Record<string, string> = {
      value: value.toString(),
      stripe_customer_id: stripeCustomerId,
    };

    if (dimensions) {
      payload.execution_type = dimensions.execution_type;

      if (dimensions.resource_id !== undefined) {
        payload.resource_id = dimensions.resource_id || 'none';
      }

      if (dimensions.execution_context_1 !== undefined) {
        payload.execution_context_1 = dimensions.execution_context_1 || 'none';
      }
    }

    await this.stripe.billing.meterEvents.create({
      event_name: eventName,
      payload,
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

  async getTotalCumulativeUsage(
    stripeMeterId: string,
    stripeCustomerId: string,
  ): Promise<number> {
    const startTime = this.getMinimumMeterStartTime();
    const endTime = new Date();

    return this.sumMeterEvents(
      stripeMeterId,
      stripeCustomerId,
      startTime,
      endTime,
    );
  }

  async getCumulativeUsageAtTime(
    stripeMeterId: string,
    stripeCustomerId: string,
    atTime: Date,
  ): Promise<number> {
    const startTime = this.getMinimumMeterStartTime();

    return this.sumMeterEvents(
      stripeMeterId,
      stripeCustomerId,
      startTime,
      atTime,
    );
  }

  /**
   * Returns a reasonable minimum start time for meter queries.
   * Stripe's billing meters API doesn't accept timestamps from 1970 (epoch).
   * Using 2020-01-01 as a safe minimum since Stripe Billing Meters is a recent feature.
   */
  private getMinimumMeterStartTime(): Date {
    return new Date('2020-01-01T00:00:00Z');
  }
}
