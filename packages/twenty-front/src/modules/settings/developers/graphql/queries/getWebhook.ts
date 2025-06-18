import gql from 'graphql-tag';

export const GET_WEBHOOK = gql`
  query GetWebhook($id: String!) {
    webhook(id: $id) {
      id
      targetUrl
      operations
      description
      secret
    }
  }
`;
