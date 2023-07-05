import { gql } from '@apollo/client';

export const GET_CLIENT_CONFIG = gql`
  query GetClientConfig {
    clientConfig {
      display_google_login
      prefill_login_with_seed
    }
  }
`;
