import { gql } from '@apollo/client';

export const API_KEY_FOR_ROLE_FRAGMENT = gql`
  fragment ApiKeyForRoleFragment on ApiKeyForRole {
    id
    name
    expiresAt
    revokedAt
  }
`;
