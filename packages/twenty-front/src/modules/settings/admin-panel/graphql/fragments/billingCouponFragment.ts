import { gql } from '@apollo/client';

export const BILLING_COUPON_FRAGMENT = gql`
  fragment BillingCouponFragment on AdminPanelBillingCoupon {
    id
    name
    percentOff
    amountOff
    currency
    duration
    durationInMonths
  }
`;
