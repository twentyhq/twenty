import { gql } from '@apollo/client';

export const CREDIT_INSTALL_APPS_ONBOARDING_REWARD = gql`
  mutation CreditInstallAppsOnboardingReward(
    $universalIdentifiers: [String!]!
  ) {
    creditInstallAppsOnboardingReward(
      universalIdentifiers: $universalIdentifiers
    ) {
      success
    }
  }
`;
