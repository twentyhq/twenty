import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_CHANNEL_THREAD_IDS = gql`
  query GetAgentChatChannelThreadIds(
    $channelId: UUID!
    $status: AgentChatChannelThreadStatus
    $assignment: AgentChatChannelAssignmentFilter
    $first: Int
    $after: String
  ) {
    agentChatChannelThreadIds(
      channelId: $channelId
      status: $status
      assignment: $assignment
      first: $first
      after: $after
    ) {
      threadIds
      hasNextPage
      endCursor
    }
  }
`;
