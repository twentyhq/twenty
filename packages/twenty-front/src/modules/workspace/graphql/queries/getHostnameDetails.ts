import { gql } from '@apollo/client';

export const GET_HOSTNAME_DETAILS = gql`
  query GetHostnameDetails {
    getHostnameDetails {
      hostname
      ownership_verification {
        name
        type
        value
      }
      ownership_verification_http {
        http_body
        http_url
      }
      status
    }
  }
`;
