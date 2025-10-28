import { gql } from '@apollo/client';

export const DELETE_PUBLIC_DOMAIN = gql`
  mutation DeletePublicDomain($domain: String!) {
    deletePublicDomain(domain: $domain)
  }
`;
