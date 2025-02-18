import { gql } from '@apollo/client';

export const GET_ALL_WORKSPACE_TRUSTED_DOMAINS = gql`
  query GetAllWorkspaceTrustedDomains {
    getAllWorkspaceTrustedDomains {
      id
      createdAt
      domain
      isValidated
    }
  }
`;
