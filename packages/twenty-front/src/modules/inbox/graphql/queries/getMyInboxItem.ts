import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const GET_MY_INBOX_ITEM = gql`
  query GetMyInboxItem($inboxItemId: UUID!) {
    myInboxItem(inboxItemId: $inboxItemId) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
