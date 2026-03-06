/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { findOrThrow, isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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

  getPhases(subscriptionSchedule: Stripe.SubscriptionSchedule) {
    const now = Math.floor(Date.now() / 1000);

    const currentPhase = findOrThrow(
      subscriptionSchedule.phases,
      (p) => {
        const s = p.start_date ?? 0;
        const e = p.end_date ?? Infinity;

        return s <= now && now < e;
      },
      new BillingException(
        `Subscription must have at least 1 current phase`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_PHASE_NOT_FOUND,
      ),
    );

    const nextPhase = (subscriptionSchedule.phases || [])
      .filter((p) => (p.start_date ?? 0) > now)
      .sort((a, b) => (a.start_date ?? 0) - (b.start_date ?? 0))[0] as
      | Stripe.SubscriptionSchedule.Phase
      | undefined;

    return {
      currentPhase,
      nextPhase,
    };
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

    return await this.stripe.subscriptionSchedules.update(scheduleId, params);
  }

  async createSubscriptionSchedule(stripeSubscriptionId: string) {
    if (!this.stripe) throw new Error('Billing is disabled');

    const schedule = await this.stripe.subscriptionSchedules.create({
      from_subscription: stripeSubscriptionId,
    });

    const currentPhase = this.getPhases(schedule).currentPhase;

    return {
      schedule,
      currentPhase,
    };
  }

  async loadSubscriptionSchedule(stripeSubscriptionId: string) {
    const subscriptionWithSchedule =
      await this.getSubscriptionWithSchedule(stripeSubscriptionId);

    if (!isDefined(subscriptionWithSchedule.schedule)) {
      return {};
    }

    const { currentPhase, nextPhase } = this.getPhases(
      subscriptionWithSchedule.schedule,
    );

    if (!isDefined(nextPhase)) {
      await this.releaseSubscriptionSchedule(
        subscriptionWithSchedule.schedule.id,
      );

      return {};
    }

    return {
      schedule: subscriptionWithSchedule.schedule,
      currentPhase,
      nextPhase,
    };
  }

  releaseSubscriptionSchedule(scheduleId: string) {
    if (!this.stripe) throw new Error('Billing is disabled');

    return this.stripe.subscriptionSchedules.release(scheduleId);
  }
}
