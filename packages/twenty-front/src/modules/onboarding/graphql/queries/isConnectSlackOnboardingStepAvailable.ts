import { gql } from '@apollo/client';

export const IS_CONNECT_SLACK_ONBOARDING_STEP_AVAILABLE = gql`
  query IsConnectSlackOnboardingStepAvailable {
    isConnectSlackOnboardingStepAvailable
  }
`;
