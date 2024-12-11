import { gql } from '@apollo/client';

export const WORKSPACE_MEMBER_QUERY_FRAGMENT = gql`
  fragment WorkspaceMemberQueryFragment on WorkspaceMember {
    id
    name {
      firstName
      lastName
    }
    colorScheme
    avatarUrl
    locale
    timeZone
    dateFormat
    timeFormat
  }
`;
