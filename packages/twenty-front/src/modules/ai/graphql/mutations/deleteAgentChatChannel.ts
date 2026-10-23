import { gql } from '@apollo/client';

export const DELETE_AGENT_CHAT_CHANNEL = gql`
  mutation DeleteAgentChatChannel(
    $channelId: UUID!
    $destinationChannelId: UUID
  ) {
    deleteAgentChatChannel(
      channelId: $channelId
      destinationChannelId: $destinationChannelId
    )
  }
`;
