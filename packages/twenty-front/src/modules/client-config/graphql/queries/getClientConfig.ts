import { gql } from '@apollo/client';

export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig {
    clientConfig {
      authProviders {
        google
        password
        microsoft
        sso
      }
      billing {
        isBillingEnabled
        billingUrl
        billingFreeTrialDurationInDays
      }
      signInPrefilled
      isMultiWorkspaceEnabled
      debugMode
      analyticsEnabled
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
      api {
        mutationMaximumAffectedRecords
      }
      chromeExtensionId
    }
  }
`;
