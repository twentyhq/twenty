import { gql } from '@apollo/client';

// TODO: Fragments should be used instead of duplicating the user fields !
export const IMPERSONATE = gql`
  mutation Impersonate($userId: String!, $workspaceId: String!) {
    impersonate(userId: $userId, workspaceId: $workspaceId) {
      workspace {
        subdomain
        id
      }
      loginToken {
        ...AuthTokenFragment
      }
    }
  }
`;
