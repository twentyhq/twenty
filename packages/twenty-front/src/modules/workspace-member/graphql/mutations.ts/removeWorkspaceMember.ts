import { gql } from '@apollo/client';

export const REMOVE_WORKSPACE_MEMBER = gql`
  mutation RemoveWorkspaceMember($memberId: String!) {
    removeWorkspaceMember(memberId: $memberId)
  }
`;
