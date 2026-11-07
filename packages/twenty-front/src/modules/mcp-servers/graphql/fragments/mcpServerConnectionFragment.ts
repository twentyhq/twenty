import gql from 'graphql-tag';

export const MCP_SERVER_CONNECTION_FRAGMENT = gql`
  fragment McpServerConnectionFragment on McpServerConnection {
    id
    handle
    scope
    isOwnedByCurrentUser
    authFailedAt
    createdAt
  }
`;
