import { gql } from '@apollo/client';

export const SWITCH_PLAN = gql`
  mutation SwitchPlan($plan: BillingPlanKey!) {
    switchPlan(plan: $plan) {
      planKey
      subscription {
        chargeType
        interval
        status
      }
      baseProduct {
        name
        description
        images
        marketingFeatures
        metadata {
          planKey
          priceUsageBased
          productKey
        }
      }
    }
  }
`;
