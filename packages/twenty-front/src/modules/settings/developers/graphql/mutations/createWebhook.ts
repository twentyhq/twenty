import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '../fragments/webhookFragment';

export const CREATE_WEBHOOK = gql`
  mutation CreateWebhook($input: CreateWebhookDTO!) {
    createWebhook(input: $input) {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
