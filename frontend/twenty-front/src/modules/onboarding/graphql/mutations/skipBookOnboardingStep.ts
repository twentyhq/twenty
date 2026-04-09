import { gql } from '@apollo/client';

export const SKIP_BOOK_ONBOARDING_STEP = gql`
  mutation SkipBookOnboardingStep {
    skipBookOnboardingStep {
      success
    }
  }
`;
