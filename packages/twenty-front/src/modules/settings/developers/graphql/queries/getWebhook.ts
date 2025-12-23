import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '@/settings/developers/graphql/fragments/webhookFragment';

export const GET_WEBHOOK = gql`
  query GetWebhook($input: GetWebhookInput!) {
    webhook(input: $input) {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
