/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class StripeCheckoutService {
  protected readonly logger = new Logger(StripeCheckoutService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
    private readonly stripeCustomerService: StripeCustomerService,
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
    workspace,
    stripeSubscriptionLineItems,
    successUrl,
    cancelUrl,
    stripeCustomerId,
    plan = BillingPlanKey.PRO,
    requirePaymentMethod = true,
    withTrialPeriod,
  }: {
    user: UserEntity;
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    stripeSubscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    successUrl?: string;
    cancelUrl?: string;
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    requirePaymentMethod?: boolean;
    withTrialPeriod: boolean;
  }): Promise<Stripe.Checkout.Session> {
    if (!isDefined(stripeCustomerId)) {
      const stripeCustomer =
        await this.stripeCustomerService.createStripeCustomer(
          user.email,
          workspace.id,
          workspace.displayName,
        );

      stripeCustomerId = stripeCustomer.id;
    }

    return await this.stripe.checkout.sessions.create({
      line_items: stripeSubscriptionLineItems,
      mode: 'subscription',
      subscription_data: {
        metadata: {
          workspaceId: workspace.id,
          plan,
        },
        ...this.getStripeSubscriptionTrialPeriodConfig(
          withTrialPeriod,
          requirePaymentMethod,
        ),
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

  async createDirectSubscription({
    user,
    workspace,
    stripeSubscriptionLineItems,
    stripeCustomerId,
    plan = BillingPlanKey.PRO,
    requirePaymentMethod = false,
    withTrialPeriod,
  }: {
    user: UserEntity;
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    stripeSubscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    requirePaymentMethod?: boolean;
    withTrialPeriod: boolean;
  }): Promise<Stripe.Subscription> {
    if (!isDefined(stripeCustomerId)) {
      const stripeCustomer =
        await this.stripeCustomerService.createStripeCustomer(
          user.email,
          workspace.id,
          workspace.displayName,
        );

      stripeCustomerId = stripeCustomer.id;
    }

    // Convert checkout session line items to subscription items format
    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] =
      stripeSubscriptionLineItems.map((lineItem) => ({
        price: lineItem.price as string,
        quantity: lineItem.quantity,
      }));

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      items: subscriptionItems,
      metadata: {
        workspaceId: workspace.id,
        plan,
      },
      ...this.getStripeSubscriptionTrialPeriodConfig(
        withTrialPeriod,
        requirePaymentMethod,
      ),
      automatic_tax: { enabled: !!requirePaymentMethod },
    };

    return await this.stripe.subscriptions.create(subscriptionParams);
  }

  private getStripeSubscriptionTrialPeriodConfig(
    withTrialPeriod: boolean,
    requirePaymentMethod: boolean,
  ) {
    return withTrialPeriod
      ? {
          trial_period_days: this.twentyConfigService.get(
            requirePaymentMethod
              ? 'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS'
              : 'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
          ),
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'create_invoice' as const,
            },
          },
        }
      : {};
  }
}
