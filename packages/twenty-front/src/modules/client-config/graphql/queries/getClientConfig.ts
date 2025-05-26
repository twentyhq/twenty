import { gql } from '@apollo/client';

// NOTE: This GraphQL query is now primarily used as fallback for local development
// For production use, the client config is injected via generateFrontConfig()
// if the backend serves the frontend, or during the build process for S3-hosted frontends.
export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig {
    clientConfig {
      billing {
        isBillingEnabled
        billingUrl
        trialPeriods {
          duration
          isCreditCardRequired
        }
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
      isEmailVerificationRequired
      defaultSubdomain
      frontDomain
      debugMode
      analyticsEnabled
      isAttachmentPreviewEnabled
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
      canManageFeatureFlags
      publicFeatureFlags {
        key
        metadata {
          label
          description
          imagePath
        }
      }
      isMicrosoftMessagingEnabled
      isMicrosoftCalendarEnabled
      isGoogleMessagingEnabled
      isGoogleCalendarEnabled
      isConfigVariablesInDbEnabled
    }
  }
`;
