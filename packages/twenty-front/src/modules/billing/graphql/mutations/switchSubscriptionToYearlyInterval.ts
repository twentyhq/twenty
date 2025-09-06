import { gql } from '@apollo/client';

export const TOGGLE_SUBSCRIPTION_INTERVAL = gql`
  mutation ToggleSubscriptionInterval {
    toggleSubscriptionInterval {
      success
    }
  }
`;
