import { gql } from '@apollo/client';

import { INBOX_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/inboxThreadParticipantFragment';

export const UPDATE_INBOX_THREAD_STATUS = gql`
  ${INBOX_THREAD_PARTICIPANT_FRAGMENT}
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
