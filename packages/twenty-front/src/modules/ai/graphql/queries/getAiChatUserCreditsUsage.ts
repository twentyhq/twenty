import { gql } from '@apollo/client';

export const GET_AI_CHAT_USER_CREDITS_USAGE = gql`
  query GetAiChatUserCreditsUsage {
    aiChatUserCreditsUsage {
      limitValue
      consumedValue
      periodEnd
    }
  }
`;
