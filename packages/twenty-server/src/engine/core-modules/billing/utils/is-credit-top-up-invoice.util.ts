/* @license Enterprise */

import type Stripe from 'stripe';

import { CREDIT_TOP_UP } from 'src/engine/core-modules/billing/constants/credit-top-up.constant';

export const isCreditTopUpInvoice = (
  invoice: Pick<Stripe.Invoice, 'metadata'>,
): boolean => invoice.metadata?.kind === CREDIT_TOP_UP;
