import { gql } from '@apollo/client';

export const UPDATE_AGENT_CHAT_CHANNEL = gql`
  mutation UpdateAgentChatChannel(
    $channelId: UUID!
    $input: UpdateAgentChatChannelInput!
  ) {
    updateAgentChatChannel(channelId: $channelId, input: $input) {
      id
    }
  }
`;
