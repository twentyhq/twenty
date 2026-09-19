import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const RUN_INBOX_ITEM_TOOL_CALLS = gql`
  ${INBOX_ITEM_FRAGMENT}
  mutation RunInboxItemToolCalls($inboxItemId: UUID!, $expectedVersion: Int) {
    runInboxItemToolCalls(
      inboxItemId: $inboxItemId
      expectedVersion: $expectedVersion
    ) {
      ...InboxItemFields
    }
  }
`;
