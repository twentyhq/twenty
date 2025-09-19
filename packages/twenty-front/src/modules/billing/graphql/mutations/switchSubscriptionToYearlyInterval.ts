import { gql } from '@apollo/client';

export const SWITCH_SUBSCRIPTION_TO_YEARLY_INTERVAL = gql`
  mutation SwitchSubscriptionToYearlyInterval {
    switchToYearlyInterval {
      success
    }
  }
`;
