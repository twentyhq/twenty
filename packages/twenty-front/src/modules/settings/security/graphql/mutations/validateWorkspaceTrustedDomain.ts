import { gql } from '@apollo/client';

export const VALIDATE_WORKSPACE_TRUSTED_DOMAIN = gql`
  mutation ValidateWorkspaceTrustedDomain($input: ValidateTrustedDomainInput!) {
    validateWorkspaceTrustedDomain(input: $input)
  }
`;
