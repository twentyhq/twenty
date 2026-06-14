import { gql } from '@apollo/client';

export const CREATE_PUBLIC_DOMAIN = gql`
  mutation CreatePublicDomain($domain: String!, $applicationId: String) {
    createPublicDomain(domain: $domain, applicationId: $applicationId) {
      id
      domain
      isValidated
      applicationId
      createdAt
    }
  }
`;
