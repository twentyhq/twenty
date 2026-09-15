import { gql } from '@apollo/client';

export const UPDATE_INBOX_ITEM_TOOL_CALL_INPUT = gql`
  mutation UpdateInboxItemToolCallInput(
    $inboxItemToolCallId: UUID!
    $editedInput: JSON!
  ) {
    updateInboxItemToolCallInput(
      inboxItemToolCallId: $inboxItemToolCallId
      editedInput: $editedInput
    ) {
      id
      status
      editedInput
    }
  }
`;
