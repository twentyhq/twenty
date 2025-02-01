import { gql } from '@apollo/client';

export const GET_HOSTNAME_DETAILS = gql`
  query GetHostnameDetails {
    getHostnameDetails {
      hostname
      ownershipVerifications {
        ... on CustomHostnameOwnershipVerificationTxt {
          type
          name
          value
        }
        ... on CustomHostnameOwnershipVerificationHttp {
          type
          body
          url
        }
      }
      status
    }
  }
`;
