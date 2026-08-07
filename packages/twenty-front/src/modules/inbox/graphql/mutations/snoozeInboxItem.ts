import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const SNOOZE_INBOX_ITEM = gql`
  mutation SnoozeInboxItem($inboxItemId: UUID!, $snoozedUntil: DateTime!) {
    snoozeInboxItem(inboxItemId: $inboxItemId, snoozedUntil: $snoozedUntil) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
