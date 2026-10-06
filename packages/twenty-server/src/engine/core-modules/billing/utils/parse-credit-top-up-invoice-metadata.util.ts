/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import type Stripe from 'stripe';

type CreditTopUpInvoiceMetadata = {
  workspaceId: string;
  creditAmountMicro: number;
};

export const parseCreditTopUpInvoiceMetadata = (
  metadata: Stripe.Metadata | null,
): CreditTopUpInvoiceMetadata | null => {
  const workspaceId = metadata?.workspaceId;
  const creditAmountMicro = Number(metadata?.creditAmountMicro);

  if (
    !isNonEmptyString(workspaceId) ||
    !Number.isSafeInteger(creditAmountMicro) ||
    creditAmountMicro <= 0
  ) {
    return null;
  }

  return { workspaceId, creditAmountMicro };
};
