import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const MARK_INBOX_ITEM_READ = gql`
  mutation MarkInboxItemRead($inboxItemId: UUID!) {
    markInboxItemRead(inboxItemId: $inboxItemId) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
