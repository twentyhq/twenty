import { gql } from '@apollo/client';

export const CREATE_INBOX_ITEM_TOOL_CALL = gql`
  mutation CreateInboxItemToolCall($input: CreateInboxItemToolCallInput!) {
    createInboxItemToolCall(input: $input) {
      id
      position
      toolName
      label
      description
      icon
      status
      inputSchema {
        key
        label
        type
        isRequired
      }
      proposedInput
      editedInput
      output
      error
    }
  }
`;
