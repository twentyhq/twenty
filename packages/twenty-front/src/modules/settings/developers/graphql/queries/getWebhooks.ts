import gql from 'graphql-tag';

export const GET_WEBHOOKS = gql`
  query GetWebhooks {
    webhooks {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
