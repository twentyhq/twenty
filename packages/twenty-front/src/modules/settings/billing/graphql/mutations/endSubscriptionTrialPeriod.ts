import { gql } from '@apollo/client';

export const END_SUBSCRIPTION_TRIAL_PERIOD = gql`
  mutation EndSubscriptionTrialPeriod {
    endSubscriptionTrialPeriod {
      status
      hasPaymentMethod
      billingPortalUrl
    }
  }
`;
