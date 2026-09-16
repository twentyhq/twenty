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
    assigneeUserWorkspaceId
    isAssignedToMe
    threadId
    subjectObjectMetadataId
    subjectRecordId
    summary
    context {
      version
      producer
      source {
        kind
        label
        detail
        excerpt
        messageCount
      }
    }
    records {
      id
      position
      label
      subtitle
      relationLabel
      objectMetadataId
      recordId
    }
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
    icon
  }
`;
