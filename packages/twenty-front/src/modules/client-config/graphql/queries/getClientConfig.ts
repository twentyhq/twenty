import { gql } from '@apollo/client';

export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig {
    clientConfig {
      authProviders {
        google
        password
      }
      billing {
        isBillingEnabled
        billingUrl
        billingFreeTrialDurationInDays
      }
      signInPrefilled
      signUpDisabled
      debugMode
      telemetry {
        enabled
        anonymizationEnabled
      }
      support {
        supportDriver
        supportFrontChatId
      }
      sentry {
        dsn
        environment
        release
      }
      captcha {
        provider
        siteKey
      }
    }
  }
`;
