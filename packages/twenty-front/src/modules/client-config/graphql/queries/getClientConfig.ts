import { gql } from '@apollo/client';

export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig {
    clientConfig {
      billing {
        isBillingEnabled
        billingUrl
        billingFreeTrialDurationInDays
      }
      authProviders {
        google
        password
        microsoft
        sso {
          id
          name
          type
          status
          issuer
        }
      }
      signInPrefilled
      isMultiWorkspaceEnabled
      isSSOEnabled
      defaultSubdomain
      frontDomain
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
