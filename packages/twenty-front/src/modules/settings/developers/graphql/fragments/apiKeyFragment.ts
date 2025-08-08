import gql from 'graphql-tag';

export const API_KEY_FRAGMENT = gql`
  fragment ApiKeyFragment on ApiKey {
    id
    name
    expiresAt
    revokedAt
    role {
      id
      label
      icon
    }
  }
`;
