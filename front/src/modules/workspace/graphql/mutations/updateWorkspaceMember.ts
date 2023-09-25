import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_MEMBER = gql`
  mutation UpdateOneWorkspaceMember(
    $data: WorkspaceMemberUpdateInput!
    $where: WorkspaceMemberWhereUniqueInput!
  ) {
    UpdateOneWorkspaceMember(data: $data, where: $where) {
      ...workspaceMemberFieldsFragment
    }
  }
`;
