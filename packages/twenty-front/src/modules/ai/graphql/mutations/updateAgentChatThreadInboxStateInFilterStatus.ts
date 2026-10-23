import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const UPDATE_AGENT_CHAT_THREAD_INBOX_STATE_IN_FILTER_STATUS = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation UpdateAgentChatThreadInboxStateInFilterStatus(
    $filterStatus: AgentChatThreadFilterStatus!
    $excludedThreadIds: [UUID!]!
    $action: AgentChatInboxAction!
    $snoozedUntil: DateTime
  ) {
    updateAgentChatThreadInboxStateInFilterStatus(
      filterStatus: $filterStatus
      excludedThreadIds: $excludedThreadIds
      action: $action
      snoozedUntil: $snoozedUntil
    ) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
