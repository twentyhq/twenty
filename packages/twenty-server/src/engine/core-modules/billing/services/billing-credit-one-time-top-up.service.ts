/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';

@Injectable()
export class BillingCreditOneTimeTopUpService {
  constructor(private readonly billingCreditService: BillingCreditService) {}

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
