/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { type OneOffInvoicePayment } from 'src/engine/core-modules/billing/types/one-off-invoice-payment.type';
import { isInvoicePaymentActionRequiredError } from 'src/engine/core-modules/billing/utils/is-invoice-payment-action-required-error.util';
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
    });

    const finalizedInvoice = await this.addItemAndFinalizeInvoiceOrDelete({
      invoiceId: invoice.id,
      stripeCustomerId,
      stripeSubscriptionId,
      amountInCents: diffAmountInCents,
      currency,
      description,
    });

    if (finalizedInvoice.status === 'paid') {
      return;
    }

    try {
      await this.stripe.invoices.pay(invoice.id);
    } catch (payError) {
      await this.settleFailedInvoiceOrThrow({
        invoiceId: invoice.id,
        payError,
      });
    }
  }

  async chargeOneOffInvoice({
    stripeCustomerId,
    stripeSubscriptionId,
    amountInCents,
    currency,
    description,
    lineDescription,
    metadata,
    isAutomaticTaxEnabled,
    idempotencyKey,
  }: {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    amountInCents: number;
    currency: string;
    description: string;
    lineDescription: string;
    metadata: Stripe.MetadataParam;
    isAutomaticTaxEnabled: boolean;
    idempotencyKey: string;
  }): Promise<OneOffInvoicePayment> {
    const invoice = await this.stripe.invoices.create(
      {
        customer: stripeCustomerId,
        subscription: stripeSubscriptionId,
        currency,
        description,
        metadata,
        pending_invoice_items_behavior: 'exclude',
        automatic_tax: { enabled: isAutomaticTaxEnabled },
        discounts: '',
      },
      { idempotencyKey: `${idempotencyKey}-invoice` },
    );

    const finalizedInvoice = await this.addItemAndFinalizeInvoiceOrDelete({
      invoiceId: invoice.id,
      stripeCustomerId,
      stripeSubscriptionId,
      amountInCents,
      currency,
      description: lineDescription,
      idempotencyKey,
    });

    if (finalizedInvoice.status === 'paid') {
      return toOneOffInvoicePayment(
        finalizedInvoice,
        BillingInvoicePaymentStatus.PAID,
      );
    }

    try {
      const paidInvoice = await this.stripe.invoices.pay(
        invoice.id,
        {},
        { idempotencyKey: `${idempotencyKey}-pay` },
      );

      return toOneOffInvoicePayment(
        paidInvoice,
        paidInvoice.status === 'paid'
          ? BillingInvoicePaymentStatus.PAID
          : BillingInvoicePaymentStatus.PROCESSING,
      );
    } catch (payError) {
      // The open invoice stays payable on its hosted page, where the customer can pass 3DS
      if (isInvoicePaymentActionRequiredError(payError)) {
        return toOneOffInvoicePayment(
          finalizedInvoice,
          BillingInvoicePaymentStatus.REQUIRES_ACTION,
        );
      }

      await this.settleFailedInvoiceOrThrow({
        invoiceId: invoice.id,
        payError,
      });

      return toOneOffInvoicePayment(
        finalizedInvoice,
        BillingInvoicePaymentStatus.PAID,
      );
    }
  }

  private async addItemAndFinalizeInvoiceOrDelete({
    invoiceId,
    stripeCustomerId,
    stripeSubscriptionId,
    amountInCents,
    currency,
    description,
    idempotencyKey,
  }: {
    invoiceId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    amountInCents: number;
    currency: string;
    description: string;
    idempotencyKey?: string;
  }): Promise<Stripe.Invoice> {
    let invoiceItemId: string | undefined;

    try {
      const invoiceItem = await this.stripe.invoiceItems.create(
        {
          customer: stripeCustomerId,
          subscription: stripeSubscriptionId,
          invoice: invoiceId,
          amount: amountInCents,
          currency,
          description,
        },
        isDefined(idempotencyKey)
          ? { idempotencyKey: `${idempotencyKey}-invoice-item` }
          : undefined,
      );

      invoiceItemId = invoiceItem.id;

      return await this.stripe.invoices.finalizeInvoice(
        invoiceId,
        { auto_advance: false },
        isDefined(idempotencyKey)
          ? { idempotencyKey: `${idempotencyKey}-finalize` }
          : undefined,
      );
    } catch (error) {
      await this.deleteDraftInvoice({
        invoiceId,
        invoiceItemId,
      });

      throw error;
    }
  }

  private async settleFailedInvoiceOrThrow({
    invoiceId,
    payError,
  }: {
    invoiceId: string;
    payError: unknown;
  }): Promise<void> {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);

    if (invoice.status === 'paid') {
      return;
    }

    const payErrorMessage = this.getErrorMessage(payError);

    try {
      await this.stripe.invoices.voidInvoice(invoiceId);
    } catch (voidError) {
      const refreshedInvoice = await this.stripe.invoices.retrieve(invoiceId);

      if (refreshedInvoice.status === 'paid') {
        return;
      }

      if (refreshedInvoice.status !== 'void') {
        throw new BillingException(
          `Failed to void invoice ${invoiceId} after payment failure (${payErrorMessage}): ${this.getErrorMessage(voidError)}`,
          BillingExceptionCode.BILLING_INVOICE_VOID_FAILED,
        );
      }
    }

    const isCardDecline =
      payError instanceof this.stripe.errors.StripeCardError;

    throw new BillingException(
      `Failed to pay invoice ${invoiceId}: ${payErrorMessage}`,
      isCardDecline
        ? BillingExceptionCode.BILLING_INVOICE_PAYMENT_FAILED
        : BillingExceptionCode.BILLING_STRIPE_ERROR,
    );
  }

  private async deleteDraftInvoice({
    invoiceId,
    invoiceItemId,
  }: {
    invoiceId: string;
    invoiceItemId?: string;
  }): Promise<void> {
    try {
      await this.stripe.invoices.del(invoiceId);
    } catch (deleteError) {
      this.logger.error(
        `Failed to delete draft invoice ${invoiceId}: ${this.getErrorMessage(deleteError)}`,
      );
    }

    if (!isDefined(invoiceItemId)) {
      return;
    }

    try {
      await this.stripe.invoiceItems.del(invoiceItemId);
    } catch (deleteError) {
      this.logger.error(
        `Failed to delete invoice item ${invoiceItemId}: ${this.getErrorMessage(deleteError)}`,
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}

const toOneOffInvoicePayment = (
  invoice: Stripe.Invoice,
  status: BillingInvoicePaymentStatus,
): OneOffInvoicePayment => ({
  status,
  stripeInvoiceId: invoice.id,
  stripeInvoiceNumber: invoice.number,
  hostedInvoiceUrl:
    status === BillingInvoicePaymentStatus.REQUIRES_ACTION
      ? (invoice.hosted_invoice_url ?? null)
      : null,
});
