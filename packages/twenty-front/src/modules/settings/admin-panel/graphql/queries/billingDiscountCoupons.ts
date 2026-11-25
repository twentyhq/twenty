import { gql } from '@apollo/client';

import { BILLING_COUPON_FRAGMENT } from '@/settings/admin-panel/graphql/fragments/billingCouponFragment';

export const BILLING_DISCOUNT_COUPONS = gql`
  ${BILLING_COUPON_FRAGMENT}
  query BillingDiscountCoupons {
    billingDiscountCoupons {
      ...BillingCouponFragment
    }
  }
`;
