import { gql } from '@apollo/client';

export const GET_HOSTNAME_DETAILS = gql`
  query GetHostnameDetails {
    getHostnameDetails {
      hostname
      records {
        type
        key
        value
        validationType
      }
      status
      sslStatus
      verificationErrors
    }
  }
`;
