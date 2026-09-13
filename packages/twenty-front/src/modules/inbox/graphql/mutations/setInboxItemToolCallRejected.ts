import { gql } from '@apollo/client';

export const SET_INBOX_ITEM_TOOL_CALL_REJECTED = gql`
  mutation SetInboxItemToolCallRejected(
    $inboxItemToolCallId: UUID!
    $isRejected: Boolean!
  ) {
    setInboxItemToolCallRejected(
      inboxItemToolCallId: $inboxItemToolCallId
      isRejected: $isRejected
    ) {
      id
      status
      editedInput
    }
  }
`;
