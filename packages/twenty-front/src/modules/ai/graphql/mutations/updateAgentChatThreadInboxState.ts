import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const UPDATE_AGENT_CHAT_THREAD_INBOX_STATE = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation UpdateAgentChatThreadInboxState(
    $threadIds: [UUID!]!
    $action: AgentChatInboxAction!
    $snoozedUntil: DateTime
  ) {
    updateAgentChatThreadInboxState(
      threadIds: $threadIds
      action: $action
      snoozedUntil: $snoozedUntil
    ) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
