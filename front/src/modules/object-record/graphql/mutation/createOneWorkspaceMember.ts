import { gql } from '@apollo/client';

export const CREATE_ONE_WORKSPACE_MEMBER_V2 = gql`
  mutation CreateOneWorkspaceMemberV2($input: WorkspaceMemberV2CreateInput!) {
    createWorkspaceMemberV2(data: $input) {
      id
      name {
        firstName
        lastName
      }
    }
  }
`;
