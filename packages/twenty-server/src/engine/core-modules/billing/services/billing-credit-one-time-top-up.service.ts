/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE } from 'src/engine/core-modules/billing/constants/credit-one-time-top-up-credit-amount-range.constant';
import { type BillingCreditOneTimeTopUpPriceDTO } from 'src/engine/core-modules/billing/dtos/billing-credit-one-time-top-up-price.dto';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { type OneOffInvoicePayment } from 'src/engine/core-modules/billing/types/one-off-invoice-payment.type';
import { buildCreditOneTimeTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/build-credit-one-time-top-up-invoice-metadata.util';
import { canComputeAutomaticTax } from 'src/engine/core-modules/billing/utils/can-compute-automatic-tax.util';
import { computeCreditOneTimeTopUpUnitPriceCents } from 'src/engine/core-modules/billing/utils/compute-credit-one-time-top-up-unit-price-cents.util';
import { findCreditOneTimeTopUpPrice } from 'src/engine/core-modules/billing/utils/find-credit-one-time-top-up-price.util';
import { isCreditOneTimeTopUpAllowedForSubscription } from 'src/engine/core-modules/billing/utils/is-credit-one-time-top-up-allowed-for-subscription.util';
import { isValidCreditOneTimeTopUpCreditAmount } from 'src/engine/core-modules/billing/utils/is-valid-credit-one-time-top-up-credit-amount.util';

@Injectable()
export class BillingCreditOneTimeTopUpService {
  constructor(
    private readonly billingCreditService: BillingCreditService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeInvoiceService: StripeInvoiceService,
  ) {}

  async getPrice(
    workspaceId: string,
  ): Promise<BillingCreditOneTimeTopUpPriceDTO | null> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (
      !isDefined(subscription) ||
      !isCreditOneTimeTopUpAllowedForSubscription(subscription)
    ) {
      return null;
    }

    const price = findCreditOneTimeTopUpPrice(subscription);

    if (!isDefined(price)) {
      return null;
    }

    return {
      unitPriceCents: computeCreditOneTimeTopUpUnitPriceCents(price),
      currency: subscription.currency,
      minimumCreditAmount: CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE.minimum,
      maximumCreditAmount: CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE.maximum,
    };
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
    if (!isValidCreditOneTimeTopUpCreditAmount(creditAmount)) {
      const { minimum, maximum } = CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE;

      throw new BillingException(
        `Cannot buy ${creditAmount} credits for workspace ${workspaceId}: not a whole number between ${minimum} and ${maximum}`,
        BillingExceptionCode.BILLING_CREDIT_AMOUNT_INVALID,
        {
          userFriendlyMessage: msg`Choose a whole number of credits between ${minimum} and ${maximum}.`,
        },
      );
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    if (!isCreditOneTimeTopUpAllowedForSubscription(subscription)) {
      throw new BillingException(
        `Cannot buy credits for workspace ${workspaceId}: subscription ${subscription.id} is ${subscription.status} or canceling`,
        BillingExceptionCode.BILLING_CREDIT_ONE_TIME_TOP_UP_NOT_ALLOWED,
      );
    }

    const price = findCreditOneTimeTopUpPrice(subscription);

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
        BillingExceptionCode.BILLING_CREDIT_ONE_TIME_TOP_UP_NOT_ALLOWED,
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
      amountInCents:
        creditAmount * computeCreditOneTimeTopUpUnitPriceCents(price),
      currency,
      description: 'Credit top-up',
      lineDescription:
        creditAmount === 1 ? '1 credit' : `${creditAmount} credits`,
      metadata: buildCreditOneTimeTopUpInvoiceMetadata({
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
