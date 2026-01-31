import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '@/settings/developers/graphql/fragments/webhookFragment';

export const DELETE_WEBHOOK = gql`
  mutation DeleteWebhook($id: UUID!) {
    deleteWebhook(id: $id) {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
