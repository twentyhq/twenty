import { gql } from '@apollo/client';

export const DELETE_INBOX_CHANNEL = gql`
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
