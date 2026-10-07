import { gql } from '@apollo/client';

export const JOIN_AGENT_CHAT_CHANNEL = gql`
  mutation JoinAgentChatChannel($channelId: UUID!) {
    joinAgentChatChannel(channelId: $channelId)
  }
`;
