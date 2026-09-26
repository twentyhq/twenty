import { gql } from '@apollo/client';

export const GET_AI_CHAT_USAGE = gql`
  query GetAiChatUsage {
    aiChatUsage {
      limitValue
      consumedValue
      periodEnd
      isUsageLimit
    }
  }
`;
