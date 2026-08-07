import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const REOPEN_INBOX_ITEM = gql`
  mutation ReopenInboxItem($inboxItemId: UUID!) {
    reopenInboxItem(inboxItemId: $inboxItemId) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
