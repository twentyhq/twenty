import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const COMPLETE_INBOX_ITEM = gql`
  mutation CompleteInboxItem($inboxItemId: UUID!) {
    completeInboxItem(inboxItemId: $inboxItemId) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
