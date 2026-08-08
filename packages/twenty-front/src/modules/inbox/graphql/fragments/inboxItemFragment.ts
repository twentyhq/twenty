import { gql } from '@apollo/client';

export const INBOX_ITEM_FRAGMENT = gql`
  fragment InboxItemFields on InboxItem {
    id
    scope
    isUnread
    priority
    version
    title
    preview
    payload
    outcome
    result
    lastEventAt
    threadId
    subjectObjectMetadataId
    subjectRecordId
    inboxItemType {
      id
      key
      label
      icon
      actions {
        key
        label
        icon
        isPrimary
        navigationKind
        transitionKind
        inputSchema {
          key
          label
          type
          isRequired
        }
      }
      outcomes {
        key
        label
      }
    }
  }
`;
