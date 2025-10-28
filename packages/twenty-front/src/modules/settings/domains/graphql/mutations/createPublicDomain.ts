import { gql } from '@apollo/client';

export const CREATE_PUBLIC_DOMAIN = gql`
  mutation CreatePublicDomain($domain: String!) {
    createPublicDomain(domain: $domain) {
      id
      domain
      isValidated
      createdAt
    }
  }
`;
