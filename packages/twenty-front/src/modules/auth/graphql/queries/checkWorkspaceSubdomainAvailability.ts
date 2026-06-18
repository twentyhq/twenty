import { gql } from '@apollo/client';

export const CHECK_WORKSPACE_SUBDOMAIN_AVAILABILITY = gql`
  query CheckWorkspaceSubdomainAvailability($subdomain: String!) {
    checkWorkspaceSubdomainAvailability(subdomain: $subdomain) {
      isValid
      available
      suggestedSubdomain
    }
  }
`;
