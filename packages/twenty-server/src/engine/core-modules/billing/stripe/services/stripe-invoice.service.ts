/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
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
    const invoice = await this.stripe.invoices.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      pending_invoice_items_behavior: 'exclude',
    });

    await this.stripe.invoiceItems.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      invoice: invoice.id,
      amount: diffAmountInCents,
      currency,
      description,
    });

    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(
      invoice.id,
      {
        auto_advance: true,
      },
    );

    if (finalizedInvoice.status === 'paid') {
      return;
    }

    try {
      await this.stripe.invoices.pay(invoice.id);
    } catch (error) {
      await this.settleFailedUpgradeInvoiceOrThrow(invoice.id, error);
    }
  }

  private async settleFailedUpgradeInvoiceOrThrow(
    invoiceId: string,
    payError: unknown,
  ): Promise<void> {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);

    if (invoice.status === 'paid') {
      return;
    }

    const payErrorMessage =
      payError instanceof Error ? payError.message : 'unknown error';

    try {
      await this.stripe.invoices.voidInvoice(invoiceId);
    } catch (voidError) {
      const refreshedInvoice = await this.stripe.invoices.retrieve(invoiceId);

      if (refreshedInvoice.status === 'paid') {
        return;
      }

      if (refreshedInvoice.status !== 'void') {
        throw new BillingException(
          `Failed to void upgrade invoice ${invoiceId} after payment failure: ${payErrorMessage}`,
          BillingExceptionCode.BILLING_UPGRADE_INVOICE_VOID_FAILED,
        );
      }
    }

    throw new BillingException(
      `Failed to pay upgrade invoice ${invoiceId}: ${payErrorMessage}`,
      BillingExceptionCode.BILLING_UPGRADE_INVOICE_PAYMENT_FAILED,
    );
  }
}
