import gql from 'graphql-tag';

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
