import { gql } from '@apollo/client';

export const IS_SUBDOMAIN_AVAILABLE = gql`
  mutation IsSubdomainAvailable($subdomain: String!) {
    isSubdomainAvailable(subdomain: $subdomain)
  }
`;
