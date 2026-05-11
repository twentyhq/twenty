/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeInvoiceService {
  protected readonly logger = new Logger(StripeInvoiceService.name);
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

  async listDraftInvoices(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Invoice[]> {
    const invoices = await this.stripe.invoices.list({
      subscription: stripeSubscriptionId,
      status: 'draft',
    });

    return invoices.data;
  }

  async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.finalizeInvoice(invoiceId, {
      auto_advance: true,
    });
  }

  async createImmediateUpgradeInvoice({
    stripeCustomerId,
    stripeSubscriptionId,
    diffAmountInCents,
    currency,
    description,
  }: {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    diffAmountInCents: number;
    currency: string;
    description: string;
  }): Promise<void> {
    await this.stripe.invoiceItems.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      amount: diffAmountInCents,
      currency,
      description,
    });

    const invoice = await this.stripe.invoices.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
    });

    await this.stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: true,
    });

    await this.stripe.invoices.pay(invoice.id);
  }
}
