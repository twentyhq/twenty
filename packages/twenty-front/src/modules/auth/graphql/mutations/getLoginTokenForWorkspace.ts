import { gql } from '@apollo/client';

export type GetLoginTokenForWorkspaceMutation = {
  getLoginTokenForWorkspace: {
    loginToken: {
      token: string;
      expiresAt: string;
    };
  };
};

export type GetLoginTokenForWorkspaceMutationVariables = {
  workspaceId: string;
};

export const GET_LOGIN_TOKEN_FOR_WORKSPACE = gql`
  mutation GetLoginTokenForWorkspace($workspaceId: UUID!) {
    getLoginTokenForWorkspace(workspaceId: $workspaceId) {
      loginToken {
        token
        expiresAt
      }
    }
  }
`;
