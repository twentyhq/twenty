/* @license Enterprise */

import type Stripe from 'stripe';

import { CREDIT_TOP_UP_INVOICE_KIND } from 'src/engine/core-modules/billing/constants/credit-top-up-invoice-kind.constant';

export const buildCreditTopUpInvoiceMetadata = ({
  workspaceId,
  userId,
  creditAmountMicro,
}: {
  workspaceId: string;
  userId: string;
  creditAmountMicro: number;
}): Stripe.MetadataParam => ({
  kind: CREDIT_TOP_UP_INVOICE_KIND,
  workspaceId,
  userId,
  creditAmountMicro: String(creditAmountMicro),
});
