import { gql } from '@apollo/client';

export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig {
    clientConfig {
      authProviders {
        google
        password
      }
      signInPrefilled
      dataModelSettingsEnabled
      developersSettingsEnabled
      debugMode
      telemetry {
        enabled
        anonymizationEnabled
      }
      support {
        supportDriver
        supportFrontChatId
      }
      flexibleBackendEnabled
    }
  }
`;
