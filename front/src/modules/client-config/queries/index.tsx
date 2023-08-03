import { gql } from '@apollo/client';

export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig($email: String) {
    clientConfig(email: $email) {
      authProviders {
        google
        password
      }
      signInPrefilled
      debugMode
      telemetry {
        enabled
        anonymizationEnabled
      }
      supportChat {
        supportDriver
        supportFrontendKey
        supportHMACKey
      }
    }
  }
`;
