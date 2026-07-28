import { gql } from '@apollo/client';

export const START_WORKSPACE_SETUP_CHAT = gql`
  mutation StartWorkspaceSetupChat($companyContext: JSON) {
    startWorkspaceSetupChat(companyContext: $companyContext) {
      outcome
      threadId
    }
  }
`;
