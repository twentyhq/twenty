/* @license Enterprise */

import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_TRUSTED_DOMAIN = gql`
  mutation CreateWorkspaceTrustDomain($input: CreateTrustedDomainInput!) {
    createWorkspaceTrustedDomain(input: $input) {
      id
      domain
      isValidated
      createdAt
    }
  }
`;
