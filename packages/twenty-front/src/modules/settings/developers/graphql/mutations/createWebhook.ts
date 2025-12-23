import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '@/settings/developers/graphql/fragments/webhookFragment';

export const CREATE_WEBHOOK = gql`
  mutation CreateWebhook($input: CreateWebhookInput!) {
    createWebhook(input: $input) {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
