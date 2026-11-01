/* @license Enterprise */

import type Stripe from 'stripe';

export const getCustomerIdFromInvoice = (
  invoice: Pick<Stripe.Invoice, 'customer'>,
): string | undefined =>
  typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;
