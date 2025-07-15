/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class StripeCheckoutService {
  protected readonly logger = new Logger(StripeCheckoutService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async createCheckoutSession({
    user,
    workspaceId,
    stripeSubscriptionLineItems,
    successUrl,
    cancelUrl,
    stripeCustomerId,
    plan = BillingPlanKey.PRO,
    requirePaymentMethod = true,
    withTrialPeriod,
  }: {
    user: User;
    workspaceId: string;
    stripeSubscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    successUrl?: string;
    cancelUrl?: string;
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    requirePaymentMethod?: boolean;
    withTrialPeriod: boolean;
  }): Promise<Stripe.Checkout.Session> {
    if (!isDefined(stripeCustomerId)) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          workspaceId,
        },
      });

      await this.billingCustomerRepository.save({
        stripeCustomerId: customer.id,
        workspaceId,
      });

      stripeCustomerId = customer.id;
    }

    return await this.stripe.checkout.sessions.create({
      line_items: stripeSubscriptionLineItems,
      mode: 'subscription',
      subscription_data: {
        metadata: {
          workspaceId,
          plan,
        },
        ...(withTrialPeriod
          ? {
              trial_period_days: this.twentyConfigService.get(
                requirePaymentMethod
                  ? 'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS'
                  : 'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
              ),
              trial_settings: {
                end_behavior: {
                  missing_payment_method: 'create_invoice',
                },
              },
            }
          : {}),
      },
      automatic_tax: { enabled: !!requirePaymentMethod },
      tax_id_collection: { enabled: !!requirePaymentMethod },
      customer: stripeCustomerId,
      customer_update: { name: 'auto', address: 'auto' },
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_collection: requirePaymentMethod
        ? 'always'
        : 'if_required',
    });
  }
}
