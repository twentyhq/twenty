import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const ADD_AGENT_CHAT_THREAD_MEMBER = gql`
  ${RECORD_SHARING_FRAGMENT}
  mutation AddAgentChatThreadMember(
    $threadId: UUID!
    $memberWorkspaceMemberId: UUID!
  ) {
    addAgentChatThreadMember(
      threadId: $threadId
      memberWorkspaceMemberId: $memberWorkspaceMemberId
    ) {
      ...RecordSharingFields
    }
  }
`;
