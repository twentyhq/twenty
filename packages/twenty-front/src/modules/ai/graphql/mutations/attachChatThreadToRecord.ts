import { gql } from '@apollo/client';

export const ATTACH_CHAT_THREAD_TO_RECORD = gql`
  mutation AttachChatThreadToRecord(
    $threadId: UUID!
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    attachChatThreadToRecord(
      threadId: $threadId
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    )
  }
`;
