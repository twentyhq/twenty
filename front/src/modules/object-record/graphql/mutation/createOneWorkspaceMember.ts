import { gql } from '@apollo/client';

export const CREATE_ONE_WORKSPACE_MEMBER_V2 = gql`
  mutation CreateOneWorkspaceMember($input: WorkspaceMemberCreateInput!) {
    createWorkspaceMember(data: $input) {
      id
      name {
        firstName
        lastName
      }
    }
  }
`;
