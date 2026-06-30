import { gql } from '@apollo/client';

export const RENEW_TOKEN = gql`
  mutation RenewToken($appToken: String!) {
    renewToken(appToken: $appToken) {
      tokens {
        ...AuthTokenPairFragment
      }
    }
  }
`;
