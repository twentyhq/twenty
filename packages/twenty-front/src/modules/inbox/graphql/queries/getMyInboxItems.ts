import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const GET_MY_INBOX_ITEMS = gql`
  query GetMyInboxItems(
    $scope: InboxItemScope
    $queueSlug: String
    $limit: Int
  ) {
    myInboxItems(scope: $scope, queueSlug: $queueSlug, limit: $limit) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
