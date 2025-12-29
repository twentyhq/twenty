/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeCreditGrantService {
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

  async createCreditGrant({
    customerId,
    creditUnits,
    unitPriceCents,
    expiresAt,
    metadata,
  }: {
    customerId: string;
    creditUnits: number;
    unitPriceCents: number;
    expiresAt: Date;
    metadata: Record<string, string>;
  }): Promise<Stripe.Billing.CreditGrant> {
    const monetaryAmount = this.convertCreditsToMonetary(
      creditUnits,
      unitPriceCents,
    );

    // Add 60 seconds buffer to ensure effective_at is in the future when Stripe processes it
    const effectiveAt = Math.floor(Date.now() / 1000) + 60;

    return this.stripe.billing.creditGrants.create({
      customer: customerId,
      amount: {
        type: 'monetary',
        monetary: { currency: 'usd', value: monetaryAmount },
      },
      applicability_config: {
        scope: { price_type: 'metered' },
      },
      category: 'promotional',
      effective_at: effectiveAt,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      name: 'Rollover credits',
      metadata,
    });
  }

  async getCustomerCreditBalance(
    customerId: string,
    unitPriceCents: number,
  ): Promise<number> {
    const balance = await this.stripe.billing.creditBalanceSummary.retrieve({
      customer: customerId,
      filter: {
        type: 'applicability_scope',
        applicability_scope: { price_type: 'metered' },
      },
    });

    const availableAmount =
      balance.balances?.[0]?.available_balance?.monetary?.value;

    if (!availableAmount) {
      return 0;
    }

    return this.convertMonetaryToCredits(availableAmount, unitPriceCents);
  }

  async voidCreditGrant(creditGrantId: string): Promise<void> {
    await this.stripe.billing.creditGrants.voidGrant(creditGrantId);
  }

  async listCreditGrants(
    customerId: string,
  ): Promise<Stripe.Billing.CreditGrant[]> {
    const grants = await this.stripe.billing.creditGrants.list({
      customer: customerId,
    });

    return grants.data;
  }

  private convertCreditsToMonetary(
    creditUnits: number,
    unitPriceCents: number,
  ): number {
    return Math.round(creditUnits * unitPriceCents);
  }

  private convertMonetaryToCredits(
    monetaryAmountCents: number,
    unitPriceCents: number,
  ): number {
    if (unitPriceCents === 0) {
      return 0;
    }

    return Math.round(monetaryAmountCents / unitPriceCents);
  }
}
