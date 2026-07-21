import { gql } from '@apollo/client';

export const TRIGGER_INSTALL_APPS_ONBOARDING_STEP = gql`
  mutation TriggerInstallAppsOnboardingStep($universalIdentifiers: [String!]!) {
    triggerInstallAppsOnboardingStep(
      universalIdentifiers: $universalIdentifiers
    ) {
      success
    }
  }
`;
