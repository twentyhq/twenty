import { gql } from '@apollo/client';

export const SET_CHAT_THREAD_SHARE = gql`
  mutation SetChatThreadShare(
    $threadId: UUID!
    $target: ChatThreadShareTargetInput!
    $enabled: Boolean!
  ) {
    setChatThreadShare(
      threadId: $threadId
      target: $target
      enabled: $enabled
    ) {
      canManage
      isEnabled
      shares {
        id
        principalId
        principalType
      }
      roles {
        id
        label
      }
    }
  }
`;
