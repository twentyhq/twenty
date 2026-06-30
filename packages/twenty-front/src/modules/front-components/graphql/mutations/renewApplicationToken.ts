import gql from 'graphql-tag';

export const RENEW_APPLICATION_TOKEN = gql`
  mutation RenewApplicationToken($applicationRefreshToken: String!) {
    renewApplicationToken(applicationRefreshToken: $applicationRefreshToken) {
      applicationAccessToken {
        token
        expiresAt
      }
      applicationRefreshToken {
        token
        expiresAt
      }
    }
  }
`;
