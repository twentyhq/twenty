import { gql } from '@apollo/client';

export const DELETE_WORKSPACE_TRUSTED_DOMAIN = gql`
  mutation DeleteWorkspaceTrustDomain($input: DeleteTrustedDomainInput!) {
    deleteWorkspaceTrustDomain(input: $input)
  }
`;
