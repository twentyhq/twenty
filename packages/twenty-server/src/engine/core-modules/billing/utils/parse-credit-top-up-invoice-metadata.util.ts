/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import type Stripe from 'stripe';

type CreditTopUpInvoiceMetadata = {
  workspaceId: string | null;
  creditAmountMicro: number | null;
};

export const parseCreditTopUpInvoiceMetadata = (
  metadata: Stripe.Metadata | null,
): CreditTopUpInvoiceMetadata => {
  const workspaceId = metadata?.workspaceId;
  const creditAmountMicro = Number(metadata?.creditAmountMicro);

  return {
    workspaceId: isNonEmptyString(workspaceId) ? workspaceId : null,
    creditAmountMicro:
      Number.isSafeInteger(creditAmountMicro) && creditAmountMicro > 0
        ? creditAmountMicro
        : null,
  };
};
