import { gql } from '@apollo/client';

export const GET_CUSTOM_HOSTNAME_DETAILS = gql`
  query GetCustomHostnameDetails {
    getCustomHostnameDetails {
      hostname
      records {
        type
        key
        value
        validationType
        status
      }
    }
  }
`;
