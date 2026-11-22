import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const REMOVE_AGENT_CHAT_THREAD_MEMBER = gql`
  ${RECORD_SHARING_FRAGMENT}
  mutation RemoveAgentChatThreadMember(
    $threadId: UUID!
    $memberWorkspaceMemberId: UUID!
  ) {
    removeAgentChatThreadMember(
      threadId: $threadId
      memberWorkspaceMemberId: $memberWorkspaceMemberId
    ) {
      ...RecordSharingFields
    }
  }
`;
