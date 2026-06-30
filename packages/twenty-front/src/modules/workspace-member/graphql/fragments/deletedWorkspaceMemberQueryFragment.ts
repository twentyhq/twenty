import { gql } from '@apollo/client';

export const DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT = gql`
  fragment DeletedWorkspaceMemberQueryFragment on DeletedWorkspaceMember {
    id
    name {
      firstName
      lastName
    }
    avatarUrl
    userEmail
  }
`;
