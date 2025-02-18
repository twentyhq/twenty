import { gql } from '@apollo/client';

export const LIST_WORKSPACE_TRUSTED_DOMAINS = gql`
  query ListWorkspaceTrustedDomains {
    listWorkspaceTrustedDomainsByWorkspaceId {
      id
      createdAt
      domain
      isValidated
    }
  }
`;
