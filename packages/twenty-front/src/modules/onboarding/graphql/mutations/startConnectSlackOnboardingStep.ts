import { gql } from '@apollo/client';

export const START_CONNECT_SLACK_ONBOARDING_STEP = gql`
  mutation StartConnectSlackOnboardingStep {
    startConnectSlackOnboardingStep {
      authorizationUrl
    }
  }
`;
