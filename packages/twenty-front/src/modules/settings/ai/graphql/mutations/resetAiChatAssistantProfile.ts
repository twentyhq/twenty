import { gql } from '@apollo/client';

export const RESET_AI_CHAT_ASSISTANT_PROFILE = gql`
  mutation ResetAiChatAssistantProfile {
    resetAiChatAssistantProfile {
      displayName
      avatarShape
      avatarColor
      avatarFace
      isAvatarAnimated
    }
  }
`;
