import gql from 'graphql-tag';

export const UPDATE_WEBHOOK = gql`
  mutation UpdateWebhook($input: UpdateWebhookDTO!) {
    updateWebhook(input: $input) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
