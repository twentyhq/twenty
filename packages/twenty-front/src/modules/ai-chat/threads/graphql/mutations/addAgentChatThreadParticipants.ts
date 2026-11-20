import { gql } from '@apollo/client';

export const ADD_AGENT_CHAT_THREAD_PARTICIPANTS = gql`
  mutation AddAgentChatThreadParticipants(
    $threadId: UUID!
    $workspaceMemberIds: [UUID!]!
  ) {
    addAgentChatThreadParticipants(
      threadId: $threadId
      workspaceMemberIds: $workspaceMemberIds
    )
  }
`;
