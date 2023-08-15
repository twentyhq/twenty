import { gql } from '@apollo/client';

export const REMOVE_WORKSPACE_MEMBER = gql`
  mutation RemoveWorkspaceMember($where: WorkspaceMemberWhereUniqueInput!) {
    deleteWorkspaceMember(where: $where) {
      id
    }
  }
`;
