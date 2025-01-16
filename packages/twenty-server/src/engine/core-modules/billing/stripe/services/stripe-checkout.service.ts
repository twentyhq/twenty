import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class StripeCheckoutService {
  protected readonly logger = new Logger(StripeCheckoutService.name);
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

  async createCheckoutSession({
    user,
    workspaceId,
    priceId,
    quantity,
    successUrl,
    cancelUrl,
    stripeCustomerId,
    plan = BillingPlanKey.PRO,
    requirePaymentMethod = true,
    withTrialPeriod,
  }: {
    user: User;
    workspaceId: string;
    priceId: string;
    quantity: number;
    successUrl?: string;
    cancelUrl?: string;
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    requirePaymentMethod?: boolean;
    withTrialPeriod: boolean;
  }): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          workspaceId,
          plan,
        },
        ...(withTrialPeriod
          ? {
              trial_period_days: this.environmentService.get(
                requirePaymentMethod
                  ? 'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS'
                  : 'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
              ),
              trial_settings: {
                end_behavior: { missing_payment_method: 'pause' },
              },
            }
          : {}),
      },
      automatic_tax: { enabled: !!requirePaymentMethod },
      tax_id_collection: { enabled: !!requirePaymentMethod },
      customer: stripeCustomerId,
      customer_update: stripeCustomerId
        ? { name: 'auto', address: 'auto' }
        : undefined,
      customer_email: stripeCustomerId ? undefined : user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_collection: requirePaymentMethod
        ? 'always'
        : 'if_required',
    });
  }
}
