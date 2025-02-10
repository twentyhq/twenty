import { gql } from '@apollo/client';

export const GET_CUSTOM_DOMAIN_DETAILS = gql`
  query GetCustomDomainDetails {
    getCustomDomainDetails {
      customDomain
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
