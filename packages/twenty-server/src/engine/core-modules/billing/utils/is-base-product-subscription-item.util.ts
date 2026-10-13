/* @license Enterprise */

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

export const isBaseProductSubscriptionItem = ({
  billingProduct,
}: Pick<BillingSubscriptionItemEntity, 'billingProduct'>): boolean =>
  billingProduct?.metadata?.productKey === BillingProductKey.BASE_PRODUCT;
