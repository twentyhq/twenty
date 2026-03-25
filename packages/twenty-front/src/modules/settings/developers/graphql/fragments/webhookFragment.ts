import gql from 'graphql-tag';

export const WEBHOOK_FRAGMENT = gql`
  fragment WebhookFragment on Webhook {
    id
    targetUrl
    operations
    description
    secret
  }
`;
