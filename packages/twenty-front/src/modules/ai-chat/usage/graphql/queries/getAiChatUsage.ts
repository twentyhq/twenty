import { gql } from '@apollo/client';

export const GET_AI_CHAT_USAGE = gql`
  query GetAiChatUsage {
    aiChatThreadFetchedUsage {
      limitValue
      consumedValue
      periodEnd
      kind
    }
    aiChatUserCreditsUsage {
      limitValue
      consumedValue
      periodEnd
    }
  }
`;
