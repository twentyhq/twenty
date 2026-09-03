import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const EXECUTE_INBOX_ITEM_ACTION = gql`
  mutation ExecuteInboxItemAction(
    $inboxItemId: UUID!
    $actionKey: String!
    $input: JSON
    $expectedVersion: Int
  ) {
    executeInboxItemAction(
      inboxItemId: $inboxItemId
      actionKey: $actionKey
      input: $input
      expectedVersion: $expectedVersion
    ) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
