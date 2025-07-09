import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '../fragments/webhookFragment';

export const GET_WEBHOOK = gql`
  query GetWebhook($input: GetWebhookDTO!) {
    webhook(input: $input) {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
