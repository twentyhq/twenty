/* @license Enterprise */

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';

export const isSendInvoiceSubscription = (
  subscription: Pick<BillingSubscriptionEntity, 'collectionMethod'>,
): boolean =>
  subscription.collectionMethod ===
  BillingSubscriptionCollectionMethod.SEND_INVOICE;
