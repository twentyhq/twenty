import { gql } from '@apollo/client';

export const SKIP_SYNC_EMAIL_ONBOARDING_STEP = gql`
  mutation SkipSyncEmailOnboardingStep($isAutoSkipped: Boolean!) {
    skipSyncEmailOnboardingStep(isAutoSkipped: $isAutoSkipped) {
      success
    }
  }
`;
