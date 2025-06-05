import { gql } from '@apollo/client';

export const SWITCH_SUBSCRIPTION_TO_ENTERPRISE_PLAN = gql`
  mutation SwitchSubscriptionToEnterprisePlan {
    switchToEnterprisePlan {
      success
    }
  }
`;
