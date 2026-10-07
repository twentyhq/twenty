/* @license Enterprise */

import type Stripe from 'stripe';

import { CREDIT_TOP_UP } from 'src/engine/core-modules/billing/constants/credit-top-up.constant';

export const buildCreditOneTimeTopUpInvoiceMetadata = ({
  workspaceId,
  userId,
  creditAmountMicro,
}: {
  workspaceId: string;
  userId: string;
  creditAmountMicro: number;
}): Stripe.MetadataParam => ({
  kind: CREDIT_TOP_UP,
  workspaceId,
  userId,
  creditAmountMicro: String(creditAmountMicro),
});
