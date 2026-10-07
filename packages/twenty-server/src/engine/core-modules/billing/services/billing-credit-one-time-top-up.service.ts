/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { CREDIT_TOP_UP_CREDIT_AMOUNTS } from 'src/engine/core-modules/billing/constants/credit-top-up-credit-amounts.constant';
import { type BillingCreditTopUpOfferDTO } from 'src/engine/core-modules/billing/dtos/billing-credit-top-up-offer.dto';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { type OneOffInvoicePayment } from 'src/engine/core-modules/billing/types/one-off-invoice-payment.type';
import { buildCreditTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/build-credit-top-up-invoice-metadata.util';
import { canComputeAutomaticTax } from 'src/engine/core-modules/billing/utils/can-compute-automatic-tax.util';
import { computeCreditTopUpAmountCents } from 'src/engine/core-modules/billing/utils/compute-credit-top-up-amount-cents.util';
import { findCreditTopUpPrice } from 'src/engine/core-modules/billing/utils/find-credit-top-up-price.util';
import { isCreditTopUpAllowedForSubscription } from 'src/engine/core-modules/billing/utils/is-credit-top-up-allowed-for-subscription.util';

@Injectable()
export class BillingCreditOneTimeTopUpService {
  constructor(
    private readonly billingCreditService: BillingCreditService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeInvoiceService: StripeInvoiceService,
  ) {}

  async getOffers(workspaceId: string): Promise<BillingCreditTopUpOfferDTO[]> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (
      !isDefined(subscription) ||
      !isCreditTopUpAllowedForSubscription(subscription)
    ) {
      return [];
    }

    const price = findCreditTopUpPrice(subscription);

    if (!isDefined(price)) {
      return [];
    }

    return CREDIT_TOP_UP_CREDIT_AMOUNTS.map((creditAmount) => ({
      creditAmount,
      amountCents: computeCreditTopUpAmountCents({
        creditAmountMicro: creditAmount * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
        price,
      }),
      currency: subscription.currency,
    }));
  }

  async purchase({
    workspaceId,
    userId,
    creditAmount,
    idempotencyKey,
  }: {
    workspaceId: string;
    userId: string;
    creditAmount: number;
    idempotencyKey: string;
  }): Promise<OneOffInvoicePayment> {
    if (!CREDIT_TOP_UP_CREDIT_AMOUNTS.includes(creditAmount)) {
      throw new BillingException(
        `Cannot buy ${creditAmount} credits for workspace ${workspaceId}: not one of the offered amounts`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
      );
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    if (!isCreditTopUpAllowedForSubscription(subscription)) {
      throw new BillingException(
        `Cannot buy credits for workspace ${workspaceId}: subscription ${subscription.id} is ${subscription.status} or canceling`,
        BillingExceptionCode.BILLING_CREDIT_TOP_UP_NOT_ALLOWED,
      );
    }

    const price = findCreditTopUpPrice(subscription);

    if (!isDefined(price)) {
      throw new BillingException(
        `Cannot buy credits for workspace ${workspaceId}: no paid resource credit price to charge at`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    const { stripeCustomerId, stripeSubscriptionId, currency } = subscription;

    if (
      !(await this.stripeCustomerService.hasPaymentMethod(stripeCustomerId))
    ) {
      throw new BillingException(
        `Cannot buy credits for workspace ${workspaceId}: customer ${stripeCustomerId} has no payment method`,
        BillingExceptionCode.BILLING_CREDIT_TOP_UP_NOT_ALLOWED,
      );
    }

    await this.stripeCustomerService.ensureDefaultPaymentMethod(
      stripeCustomerId,
    );

    const creditAmountMicro =
      creditAmount * INTERNAL_CREDITS_PER_DISPLAY_CREDIT;

    const payment = await this.stripeInvoiceService.chargeOneOffInvoice({
      stripeCustomerId,
      stripeSubscriptionId,
      amountInCents: computeCreditTopUpAmountCents({
        creditAmountMicro,
        price,
      }),
      currency,
      description: 'Credit top-up',
      lineDescription: `${creditAmount} credits`,
      metadata: buildCreditTopUpInvoiceMetadata({
        workspaceId,
        userId,
        creditAmountMicro,
      }),
      isAutomaticTaxEnabled: canComputeAutomaticTax(
        await this.stripeCustomerService.getAutomaticTaxStatus(
          stripeCustomerId,
        ),
      ),
      idempotencyKey: `credit-top-up-${workspaceId}-${idempotencyKey}`,
    });

    if (payment.status === BillingInvoicePaymentStatus.PAID) {
      await this.grantPurchasedCredits({
        workspaceId,
        creditAmountMicro,
        stripeInvoiceId: payment.stripeInvoiceId,
        stripeInvoiceNumber: payment.stripeInvoiceNumber,
      });
    }

    return payment;
  }

  async grantPurchasedCredits({
    workspaceId,
    creditAmountMicro,
    stripeInvoiceId,
    stripeInvoiceNumber,
  }: {
    workspaceId: string;
    creditAmountMicro: number;
    stripeInvoiceId: string;
    stripeInvoiceNumber: string | null;
  }): Promise<BillingCreditGrantEntity | null> {
    return this.billingCreditService.grantCredits({
      workspaceId,
      amountMicro: creditAmountMicro,
      type: BillingCreditGrantType.PURCHASE,
      reason: `Credit top-up, invoice ${stripeInvoiceNumber ?? stripeInvoiceId}`,
      idempotencyKey: buildCreditTopUpIdempotencyKey(stripeInvoiceId),
    });
  }
}

const buildCreditTopUpIdempotencyKey = (stripeInvoiceId: string): string =>
  `credit-top-up:${stripeInvoiceId}`;
