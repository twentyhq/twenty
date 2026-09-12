import { BillingProductKey } from '~/generated-metadata/graphql';

type BaseProductSubscriptionItem = {
  billingProduct: { metadata: { productKey: BillingProductKey } };
};

export const findBaseProductSubscriptionItem = <
  TItem extends BaseProductSubscriptionItem,
>(
  billingSubscriptionItems: TItem[] | null | undefined,
): TItem | undefined =>
  billingSubscriptionItems?.find(
    (billingSubscriptionItem) =>
      billingSubscriptionItem.billingProduct.metadata.productKey ===
      BillingProductKey.BASE_PRODUCT,
  );
