/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { getCustomerIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-customer-id-from-invoice.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { CREDIT_ONE_TIME_TOP_UP_CREDIT_AMOUNT_RANGE } from 'src/engine/core-modules/billing/constants/credit-one-time-top-up-credit-amount-range.constant';
import { type BillingCreditOneTimeTopUpPriceDTO } from 'src/engine/core-modules/billing/dtos/billing-credit-one-time-top-up-price.dto';
import { type BillingCreditOneTimeTopUpDTO } from 'src/engine/core-modules/billing/dtos/billing-credit-one-time-top-up.dto';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditOneTimeTopUpStatus } from 'src/engine/core-modules/billing/enums/billing-credit-one-time-top-up-status.enum';
import { BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { buildCreditOneTimeTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/build-credit-one-time-top-up-invoice-metadata.util';
import { canComputeAutomaticTax } from 'src/engine/core-modules/billing/utils/can-compute-automatic-tax.util';
import { computeCreditOneTimeTopUpUnitPriceCents } from 'src/engine/core-modules/billing/utils/compute-credit-one-time-top-up-unit-price-cents.util';
import { findCreditOneTimeTopUpPrice } from 'src/engine/core-modules/billing/utils/find-credit-one-time-top-up-price.util';
import { isCreditOneTimeTopUpAllowedForSubscription } from 'src/engine/core-modules/billing/utils/is-credit-one-time-top-up-allowed-for-subscription.util';
import { isSendInvoiceSubscription } from 'src/engine/core-modules/billing/utils/is-send-invoice-subscription.util';
import { isValidCreditOneTimeTopUpCreditAmount } from 'src/engine/core-modules/billing/utils/is-valid-credit-one-time-top-up-credit-amount.util';
import { parseCreditTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/parse-credit-top-up-invoice-metadata.util';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingCreditOneTimeTopUpService {
  private readonly logger = new Logger(BillingCreditOneTimeTopUpService.name);

  constructor(
    private readonly billingCreditService: BillingCreditService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
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
  }): Promise<
    Pick<BillingCreditOneTimeTopUpDTO, 'status' | 'hostedInvoiceUrl'>
  > {
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
    const creditAmountMicro =
      creditAmount * INTERNAL_CREDITS_PER_DISPLAY_CREDIT;
    const amountInCents =
      creditAmount * computeCreditOneTimeTopUpUnitPriceCents(price);
    const lineDescription =
      creditAmount === 1 ? '1 credit' : `${creditAmount} credits`;
    const metadata = buildCreditOneTimeTopUpInvoiceMetadata({
      workspaceId,
      userId,
      creditAmountMicro,
    });
    const stripeIdempotencyKey = `credit-top-up-${workspaceId}-${idempotencyKey}`;

    if (isSendInvoiceSubscription(subscription)) {
      const invoiceItem =
        await this.stripeInvoiceService.createPendingInvoiceItem({
          stripeCustomerId,
          stripeSubscriptionId,
          amountInCents,
          currency,
          description: `Credit top-up - ${lineDescription}`,
          metadata,
          isDiscountable: false,
          idempotencyKey: `${stripeIdempotencyKey}-pending-invoice-item`,
        });

      try {
        await this.grantPurchasedCredits({
          workspaceId,
          creditAmountMicro,
          stripeObjectId: invoiceItem.id,
          reason: `Credit top-up, billed on the next invoice (${invoiceItem.id})`,
        });
      } catch (error) {
        throw new BillingException(
          `Pending invoice item ${invoiceItem.id} bills workspace ${workspaceId} for ${creditAmount} credits that were not granted: ${error instanceof Error ? error.message : 'unknown error'}`,
          BillingExceptionCode.BILLING_CREDIT_TOP_UP_NOT_GRANTED,
        );
      }

      return {
        status: BillingCreditOneTimeTopUpStatus.ADDED_TO_NEXT_INVOICE,
        hostedInvoiceUrl: null,
      };
    }

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

    const payment = await this.stripeInvoiceService.chargeOneOffInvoice({
      stripeCustomerId,
      stripeSubscriptionId,
      amountInCents,
      currency,
      description: 'Credit top-up',
      lineDescription,
      metadata,
      isAutomaticTaxEnabled: canComputeAutomaticTax(
        await this.stripeCustomerService.getAutomaticTaxStatus(
          stripeCustomerId,
        ),
      ),
      idempotencyKey: stripeIdempotencyKey,
    });

    if (payment.status === BillingInvoicePaymentStatus.PAID) {
      await this.grantPurchasedCredits({
        workspaceId,
        creditAmountMicro,
        stripeObjectId: payment.stripeInvoiceId,
        reason: `Credit top-up, invoice ${payment.stripeInvoiceNumber ?? payment.stripeInvoiceId}`,
      });
    }

    return {
      status: BillingCreditOneTimeTopUpStatus[payment.status],
      hostedInvoiceUrl: payment.hostedInvoiceUrl,
    };
  }

  async grantPurchasedCreditsForPaidInvoice(
    invoice: Stripe.Invoice,
  ): Promise<string | null> {
    const stripeCustomerId = getCustomerIdFromInvoice(invoice);
    const { workspaceId, creditAmountMicro } = parseCreditTopUpInvoiceMetadata(
      invoice.metadata,
    );

    if (!isDefined(workspaceId)) {
      return this.reportUngrantedInvoice(
        invoice,
        'its metadata names no workspace',
      );
    }

    if (!isDefined(creditAmountMicro)) {
      return this.reportUngrantedInvoice(
        invoice,
        `its metadata has no positive credit amount (${invoice.metadata?.creditAmountMicro})`,
      );
    }

    if (!isDefined(stripeCustomerId)) {
      return this.reportUngrantedInvoice(invoice, 'it has no customer');
    }

    const billingCustomer = await this.billingCustomerRepository.findOne(
      workspaceId,
      { where: { stripeCustomerId } },
    );

    if (!isDefined(billingCustomer)) {
      return this.reportUngrantedInvoice(
        invoice,
        `customer ${stripeCustomerId} is not the billing customer of workspace ${workspaceId}`,
      );
    }

    await this.grantPurchasedCredits({
      workspaceId,
      creditAmountMicro,
      stripeObjectId: invoice.id,
      reason: `Credit top-up, invoice ${invoice.number ?? invoice.id}`,
    });

    return workspaceId;
  }

  private async grantPurchasedCredits({
    workspaceId,
    creditAmountMicro,
    stripeObjectId,
    reason,
  }: {
    workspaceId: string;
    creditAmountMicro: number;
    stripeObjectId: string;
    reason: string;
  }): Promise<BillingCreditGrantEntity | null> {
    return this.billingCreditService.grantCredits({
      workspaceId,
      amountMicro: creditAmountMicro,
      type: BillingCreditGrantType.PURCHASE,
      reason,
      idempotencyKey: buildCreditTopUpIdempotencyKey(stripeObjectId),
    });
  }

  private reportUngrantedInvoice(
    invoice: Stripe.Invoice,
    reason: string,
  ): null {
    const message = `Paid credit top-up invoice ${invoice.id} granted nothing: ${reason}`;

    this.logger.error(message);
    this.exceptionHandlerService.captureExceptions([
      new BillingException(
        message,
        BillingExceptionCode.BILLING_CREDIT_TOP_UP_NOT_GRANTED,
      ),
    ]);

    return null;
  }
}

const buildCreditTopUpIdempotencyKey = (stripeObjectId: string): string =>
  `credit-top-up:${stripeObjectId}`;
