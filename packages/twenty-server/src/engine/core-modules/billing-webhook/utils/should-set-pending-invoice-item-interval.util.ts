/* @license Enterprise */

import type Stripe from 'stripe';

import { NOT_ENDED_SUBSCRIPTION_STATUSES } from 'src/engine/core-modules/billing/constants/not-ended-subscription-statuses.constant';
import { type SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const shouldSetPendingInvoiceItemInterval = (
  subscription: Pick<
    Stripe.Subscription,
    'collection_method' | 'pending_invoice_item_interval' | 'status'
  >,
): boolean =>
  subscription.collection_method === 'send_invoice' &&
  subscription.pending_invoice_item_interval === null &&
  NOT_ENDED_SUBSCRIPTION_STATUSES.includes(
    subscription.status as SubscriptionStatus,
  );
