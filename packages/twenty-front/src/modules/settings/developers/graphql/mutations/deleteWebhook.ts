import gql from 'graphql-tag';

export const DELETE_WEBHOOK = gql`
  mutation DeleteWebhook($input: DeleteWebhookInput!) {
    deleteWebhook(input: $input)
  }
`;
