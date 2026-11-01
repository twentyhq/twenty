import { BillingSubscriptionCollectionMethod } from '~/generated-metadata/graphql';

export const isSendInvoiceBillingSubscription = (
  collectionMethod: BillingSubscriptionCollectionMethod | null | undefined,
) => collectionMethod === BillingSubscriptionCollectionMethod.SEND_INVOICE;
