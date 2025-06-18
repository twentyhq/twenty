import gql from 'graphql-tag';

export const CREATE_WEBHOOK = gql`
  mutation CreateWebhook(
    $targetUrl: String!
    $operations: [String!]!
    $description: String
    $secret: String
  ) {
    createWebhook(
      targetUrl: $targetUrl
      operations: $operations
      description: $description
      secret: $secret
    ) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
