import { gql } from '@apollo/client';

export const INBOX_ITEM_FRAGMENT = gql`
  fragment InboxItemFields on InboxItem {
    id
    status
    priority
    title
    preview
    payload
    readAt
    snoozedUntil
    threadId
    subjectObjectMetadataId
    subjectRecordId
    createdAt
    updatedAt
    inboxItemType {
      id
      key
      label
      icon
      binding
      actions {
        key
        label
        icon
        isPrimary
        handlerKind
      }
    }
  }
`;
