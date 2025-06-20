import gql from 'graphql-tag';

export const GET_WEBHOOKS = gql`
  query GetWebhooks {
    coreWebhooks {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
