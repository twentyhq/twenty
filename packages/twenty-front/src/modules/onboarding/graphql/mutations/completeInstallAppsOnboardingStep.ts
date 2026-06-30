import { gql } from '@apollo/client';

export const COMPLETE_INSTALL_APPS_ONBOARDING_STEP = gql`
  mutation CompleteInstallAppsOnboardingStep(
    $universalIdentifiers: [String!]!
  ) {
    completeInstallAppsOnboardingStep(
      universalIdentifiers: $universalIdentifiers
    ) {
      success
    }
  }
`;
