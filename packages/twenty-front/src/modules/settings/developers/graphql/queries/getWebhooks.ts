import gql from 'graphql-tag';
import { WEBHOOK_FRAGMENT } from '../fragments/webhookFragment';

export const GET_WEBHOOKS = gql`
  query GetWebhooks {
    webhooks {
      ...WebhookFragment
    }
  }
  ${WEBHOOK_FRAGMENT}
`;
