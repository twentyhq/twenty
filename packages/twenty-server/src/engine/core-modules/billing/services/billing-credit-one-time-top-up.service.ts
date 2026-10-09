/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { getCustomerIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-customer-id-from-invoice.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { parseCreditTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/parse-credit-top-up-invoice-metadata.util';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingCreditOneTimeTopUpService {
  private readonly logger = new Logger(BillingCreditOneTimeTopUpService.name);

  constructor(
    private readonly billingCreditService: BillingCreditService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

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
      stripeInvoiceId: invoice.id,
      stripeInvoiceNumber: invoice.number,
    });

    return workspaceId;
  }

  private async grantPurchasedCredits({
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

const buildCreditTopUpIdempotencyKey = (stripeInvoiceId: string): string =>
  `credit-top-up:${stripeInvoiceId}`;
