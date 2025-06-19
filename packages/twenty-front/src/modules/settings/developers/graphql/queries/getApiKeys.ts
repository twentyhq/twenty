import gql from 'graphql-tag';

export const GET_API_KEYS = gql`
  query GetApiKeys {
    coreApiKeys {
      id
      name
      expiresAt
      revokedAt
    }
  }
`;
