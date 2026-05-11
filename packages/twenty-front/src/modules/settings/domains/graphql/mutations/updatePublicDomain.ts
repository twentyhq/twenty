import { gql } from '@apollo/client';

export const UPDATE_PUBLIC_DOMAIN = gql`
  mutation UpdatePublicDomain($domain: String!, $applicationId: String) {
    updatePublicDomain(domain: $domain, applicationId: $applicationId) {
      id
      domain
      isValidated
      applicationId
      createdAt
    }
  }
`;
