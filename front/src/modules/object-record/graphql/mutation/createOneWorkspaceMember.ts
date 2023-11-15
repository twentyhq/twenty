import { gql } from '@apollo/client';

export const CREATE_ONE_WORKSPACE_MEMBER_V2 = gql`
  query CreateWorkspaceMembersV2($input: WorkspaceMemberV2CreateInput) {
    createWorkspaceMembersV2(input: $input) {
      edges {
        node {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
