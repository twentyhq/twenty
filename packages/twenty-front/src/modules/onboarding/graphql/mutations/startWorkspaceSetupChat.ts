import { gql } from '@apollo/client';

export const START_WORKSPACE_SETUP_CHAT = gql`
  mutation StartWorkspaceSetupChat(
    $companyContext: JSON
    $personContext: JSON
  ) {
    startWorkspaceSetupChat(
      companyContext: $companyContext
      personContext: $personContext
    ) {
      outcome
      thread {
        id
        title
        totalInputTokens
        totalOutputTokens
        contextWindowTokens
        conversationSize
        totalInputCredits
        totalOutputCredits
        deletedAt
        lastMessageAt
        createdAt
        updatedAt
      }
    }
  }
`;
