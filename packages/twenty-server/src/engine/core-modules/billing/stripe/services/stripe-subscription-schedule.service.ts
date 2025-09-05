/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';

@Injectable()
export class StripeSubscriptionScheduleService {
  protected readonly logger = new Logger(
    StripeSubscriptionScheduleService.name,
  );
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

  async findOrCreateSubscriptionSchedule(
    subscription: SubscriptionWithSchedule,
  ) {
    return (
      subscription.schedule ??
      (await this.createScheduleFromSubscription(subscription.id))
    );
  }

  async getSubscriptionWithSchedule(stripeSubscriptionId: string) {
    return (await this.stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['schedule'],
    })) as SubscriptionWithSchedule;
  }

  async updateSchedule(
    scheduleId: string,
    params: Stripe.SubscriptionScheduleUpdateParams,
  ) {
    if (!this.stripe) throw new Error('Billing is disabled');

    return this.stripe.subscriptionSchedules.update(scheduleId, params);
  }

  async createScheduleFromSubscription(subscriptionId: string) {
    return this.stripe.subscriptionSchedules.create({
      from_subscription: subscriptionId,
    });
  }
}
