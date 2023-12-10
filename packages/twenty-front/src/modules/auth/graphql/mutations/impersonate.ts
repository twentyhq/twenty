import { gql } from '@apollo/client';

// TODO: Fragments should be used instead of duplicating the user fields !
export const IMPERSONATE = gql`
  mutation Impersonate($userId: String!) {
    impersonate(userId: $userId) {
      user {
        ...UserQueryFragment
      }
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
