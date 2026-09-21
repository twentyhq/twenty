import { gql } from '@apollo/client';

export const COMPLETE_BOOK_CALL_ONBOARDING_STEP = gql`
  mutation CompleteBookCallOnboardingStep(
    $hasBookedCall: Boolean!
    $isAutoSkipped: Boolean!
  ) {
    completeBookCallOnboardingStep(
      hasBookedCall: $hasBookedCall
      isAutoSkipped: $isAutoSkipped
    ) {
      success
    }
  }
`;
