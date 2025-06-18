import gql from 'graphql-tag';

export const UPDATE_WEBHOOK = gql`
  mutation UpdateWebhook(
    $id: String!
    $targetUrl: String
    $operations: [String!]
    $description: String
    $secret: String
  ) {
    updateWebhook(
      id: $id
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
