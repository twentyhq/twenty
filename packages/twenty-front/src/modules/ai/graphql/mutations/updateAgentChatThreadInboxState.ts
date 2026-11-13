import { gql } from '@apollo/client';

import { AI_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const UPDATE_INBOX_THREAD_STATUS = gql`
  ${AI_CHAT_THREAD_PARTICIPANT_FRAGMENT}
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
