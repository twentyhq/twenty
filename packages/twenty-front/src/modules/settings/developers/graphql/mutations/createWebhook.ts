import gql from 'graphql-tag';

export const CREATE_WEBHOOK = gql`
  mutation CreateWebhook($input: CreateWebhookDTO!) {
    createWebhook(input: $input) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
