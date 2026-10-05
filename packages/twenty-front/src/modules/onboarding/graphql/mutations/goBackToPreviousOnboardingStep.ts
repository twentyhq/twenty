import { gql } from '@apollo/client';

export const GO_BACK_TO_PREVIOUS_ONBOARDING_STEP = gql`
  mutation GoBackToPreviousOnboardingStep {
    goBackToPreviousOnboardingStep {
      onboardingStatus
      previousOnboardingStatus
    }
  }
`;
