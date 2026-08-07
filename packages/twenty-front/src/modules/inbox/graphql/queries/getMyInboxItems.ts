import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const GET_MY_INBOX_ITEMS = gql`
  query GetMyInboxItems($scope: InboxItemScope) {
    myInboxItems(scope: $scope) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
