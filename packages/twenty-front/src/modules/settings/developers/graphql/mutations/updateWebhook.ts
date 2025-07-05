import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '../fragments/webhookFragment';

export const UPDATE_WEBHOOK = gql`
  mutation UpdateWebhook($input: UpdateWebhookDTO!) {
    updateWebhook(input: $input) {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
