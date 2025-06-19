import gql from 'graphql-tag';

export const UPDATE_WEBHOOK = gql`
  mutation UpdateWebhook($input: UpdateWebhookDTO!) {
    updateCoreWebhook(input: $input) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
