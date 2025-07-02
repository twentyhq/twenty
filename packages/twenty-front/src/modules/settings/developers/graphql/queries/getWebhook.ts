import gql from 'graphql-tag';

export const GET_WEBHOOK = gql`
  query GetWebhook($input: GetWebhookDTO!) {
    webhook(input: $input) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
