import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const GET_AGENT_CHAT_THREAD_MEMBERS = gql`
  ${RECORD_SHARING_FRAGMENT}
  query GetAgentChatThreadMembers($threadId: UUID!) {
    agentChatThreadMembers(threadId: $threadId) {
      ...RecordSharingFields
    }
  }
`;
