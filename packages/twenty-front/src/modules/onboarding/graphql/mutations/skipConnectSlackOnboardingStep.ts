import { gql } from '@apollo/client';

export const SKIP_CONNECT_SLACK_ONBOARDING_STEP = gql`
  mutation SkipConnectSlackOnboardingStep($isAutoSkipped: Boolean!) {
    skipConnectSlackOnboardingStep(isAutoSkipped: $isAutoSkipped) {
      success
    }
  }
`;
