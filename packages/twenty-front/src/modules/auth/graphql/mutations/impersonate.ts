import { gql } from '@apollo/client';

// TODO: Fragments should be used instead of duplicating the user fields !
export const IMPERSONATE = gql`
  mutation Impersonate($userId: UUID!, $workspaceId: UUID!) {
    impersonate(userId: $userId, workspaceId: $workspaceId) {
      workspace {
        workspaceUrls {
          ...WorkspaceUrlsFragment
        }
        id
      }
      loginToken {
        ...AuthTokenFragment
      }
    }
  }
`;
