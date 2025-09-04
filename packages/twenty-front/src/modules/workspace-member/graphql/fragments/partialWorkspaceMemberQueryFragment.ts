import { gql } from '@apollo/client';

export const PARTIAL_WORKSPACE_MEMBER_QUERY_FRAGMENT = gql`
  fragment PartialWorkspaceMemberQueryFragment on WorkspaceMember {
    id
    name {
      firstName
      lastName
    }
    avatarUrl
    userEmail
  }
`;
