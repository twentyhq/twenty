import { gql } from '@apollo/client';

export const GET_WORKSPACE_AI_CHAT_ASSISTANT_PROFILE = gql`
  query GetWorkspaceAiChatAssistantProfile {
    currentWorkspace {
      id
      aiChatAssistantProfile {
        displayName
        avatarShape
        avatarColor
        avatarFace
        isAvatarAnimated
      }
    }
  }
`;
