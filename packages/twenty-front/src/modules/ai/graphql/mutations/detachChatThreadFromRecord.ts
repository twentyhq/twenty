import { gql } from '@apollo/client';

export const DETACH_CHAT_THREAD_FROM_RECORD = gql`
  mutation DetachChatThreadFromRecord(
    $threadId: UUID!
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    detachChatThreadFromRecord(
      threadId: $threadId
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    )
  }
`;
