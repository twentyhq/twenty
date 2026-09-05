import { gql } from '@apollo/client';

export const INBOX_ITEM_FRAGMENT = gql`
  fragment InboxItemFields on InboxItem {
    id
    scope
    isUnread
    priority
    version
    title
    outcome
    lastEventAt
    queueId
    isAssignedToMe
    threadId
    subjectObjectMetadataId
    subjectRecordId
    context
    toolCalls {
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
    inboxItemType {
      id
      key
      label
      icon
    }
  }
`;
