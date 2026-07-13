/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
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
    couponCode,
  }: {
    user: AuthContextUser;
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    stripeSubscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    successUrl?: string;
    cancelUrl?: string;
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    requirePaymentMethod?: boolean;
    withTrialPeriod: boolean;
    couponCode?: string;
  }): Promise<Stripe.Checkout.Session> {
    stripeCustomerId = await this.getOrCreateStripeCustomerId({
      user,
      workspace,
      stripeCustomerId,
    });

    const discounts = await this.getStripeDiscountsFromCouponCode(couponCode);

    return await this.stripe.checkout.sessions.create({
      line_items: stripeSubscriptionLineItems,
      mode: 'subscription',
      ...(isDefined(discounts) ? { discounts } : {}),
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
    couponCode,
  }: {
    user: AuthContextUser;
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    stripeSubscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    requirePaymentMethod?: boolean;
    withTrialPeriod: boolean;
    couponCode?: string;
  }): Promise<Stripe.Subscription> {
    stripeCustomerId = await this.getOrCreateStripeCustomerId({
      user,
      workspace,
      stripeCustomerId,
    });

    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] =
      stripeSubscriptionLineItems.map((lineItem) => ({
        price: lineItem.price as string,
        quantity: lineItem.quantity,
      }));

    const discounts = await this.getStripeDiscountsFromCouponCode(couponCode);

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      items: subscriptionItems,
      ...(isDefined(discounts) ? { discounts } : {}),
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

  async createSubscriptionWithPaymentMethodCollection({
    user,
    workspace,
    stripeSubscriptionLineItems,
    stripeCustomerId,
    plan = BillingPlanKey.PRO,
    withTrialPeriod,
    idempotencyKey,
    couponCode,
  }: {
    user: AuthContextUser;
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    stripeSubscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    stripeCustomerId?: string;
    plan?: BillingPlanKey;
    withTrialPeriod: boolean;
    idempotencyKey: string;
    couponCode?: string;
  }): Promise<Stripe.Subscription> {
    const customerId = await this.getOrCreateStripeCustomerId({
      user,
      workspace,
      stripeCustomerId,
    });

    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] =
      stripeSubscriptionLineItems.map((lineItem) => ({
        price: lineItem.price as string,
        quantity: lineItem.quantity,
      }));

    const discounts = await this.getStripeDiscountsFromCouponCode(couponCode);

    return await this.stripe.subscriptions.create(
      {
        customer: customerId,
        items: subscriptionItems,
        ...(isDefined(discounts) ? { discounts } : {}),
        metadata: {
          workspaceId: workspace.id,
          plan,
        },
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        ...this.getStripeSubscriptionTrialPeriodConfig(withTrialPeriod, true),
        automatic_tax: { enabled: false },
        expand: ['pending_setup_intent', 'latest_invoice.confirmation_secret'],
      },
      {
        idempotencyKey: `onboarding-subscription-${workspace.id}-${idempotencyKey}`,
      },
    );
  }

  async retrieveSubscriptionForResume(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['pending_setup_intent', 'latest_invoice.confirmation_secret'],
    });
  }

  // Coupon codes shared in URLs are customer-facing Stripe promotion codes;
  // raw coupon ids are also accepted as a fallback. An invalid code must not
  // block the checkout, so it is ignored with a warning.
  private async getStripeDiscountsFromCouponCode(
    couponCode?: string,
  ): Promise<Array<{ coupon?: string; promotion_code?: string }> | undefined> {
    if (!isNonEmptyString(couponCode)) {
      return undefined;
    }

    try {
      const promotionCodes = await this.stripe.promotionCodes.list({
        code: couponCode,
        active: true,
        limit: 1,
      });

      const promotionCode = promotionCodes.data[0];

      if (isDefined(promotionCode)) {
        return [{ promotion_code: promotionCode.id }];
      }

      const coupon = await this.stripe.coupons.retrieve(couponCode);

      if (coupon.valid) {
        return [{ coupon: coupon.id }];
      }
    } catch {
      // a missing coupon throws resource_missing, handled by the warning below
    }

    this.logger.warn(`Ignoring invalid coupon code "${couponCode}"`);

    return undefined;
  }

  private async getOrCreateStripeCustomerId({
    user,
    workspace,
    stripeCustomerId,
  }: {
    user: AuthContextUser;
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    stripeCustomerId?: string;
  }): Promise<string> {
    if (isDefined(stripeCustomerId)) {
      return stripeCustomerId;
    }

    const stripeCustomer =
      await this.stripeCustomerService.createStripeCustomer(
        user.email,
        workspace.id,
        workspace.displayName,
      );

    return stripeCustomer.id;
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
