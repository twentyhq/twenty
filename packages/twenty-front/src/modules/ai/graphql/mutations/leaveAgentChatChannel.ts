import { gql } from '@apollo/client';

export const LEAVE_AGENT_CHAT_CHANNEL = gql`
  mutation LeaveAgentChatChannel($channelId: UUID!) {
    leaveAgentChatChannel(channelId: $channelId)
  }
`;
