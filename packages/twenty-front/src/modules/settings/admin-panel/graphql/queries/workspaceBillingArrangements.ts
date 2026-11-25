import { gql } from '@apollo/client';

import { BILLING_COUPON_FRAGMENT } from '@/settings/admin-panel/graphql/fragments/billingCouponFragment';
import { USER_INFO_FRAGMENT } from '@/settings/admin-panel/graphql/fragments/userInfoFragment';

export const WORKSPACE_BILLING_ARRANGEMENTS = gql`
  ${USER_INFO_FRAGMENT}
  ${BILLING_COUPON_FRAGMENT}
  query WorkspaceBillingArrangements($workspaceId: UUID!) {
    workspaceBillingArrangements(workspaceId: $workspaceId) {
      id
      type
      label
      comment
      seats
      seatCapMode
      stripeDiscountId
      stripeCouponId
      coupon {
        ...BillingCouponFragment
      }
      creditAllowance
      stripeCreditNoteId
      creditGrantId
      usageLimit {
        id
        resourceType
        operationType
        periodCount
        periodUnit
        unit
        limitValue
      }
      startsAt
      endDate
      status
      isManageable
      grantedBy {
        ...UserInfoFragment
      }
      revokedBy {
        ...UserInfoFragment
      }
      createdAt
    }
  }
`;
