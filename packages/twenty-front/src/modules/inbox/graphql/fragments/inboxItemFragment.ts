import { gql } from '@apollo/client';

export const INBOX_ITEM_FRAGMENT = gql`
  fragment InboxItemFields on InboxItem {
    id
    status
    priority
    version
    title
    preview
    payload
    outcome
    result
    cancellationReason
    readAt
    snoozedUntil
    claimedByUserWorkspaceId
    claimExpiresAt
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
