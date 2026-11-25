/* @license Enterprise */

import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';

export type DiscountSyncAction =
  | { type: 'NONE' }
  | { type: 'END' }
  | { type: 'START'; discount: StripeCouponDiscount };
