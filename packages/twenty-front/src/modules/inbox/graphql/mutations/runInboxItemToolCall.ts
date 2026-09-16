import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const RUN_INBOX_ITEM_TOOL_CALL = gql`
  ${INBOX_ITEM_FRAGMENT}
  mutation RunInboxItemToolCall(
    $inboxItemToolCallId: UUID!
    $expectedVersion: Int
  ) {
    runInboxItemToolCall(
      inboxItemToolCallId: $inboxItemToolCallId
      expectedVersion: $expectedVersion
    ) {
      ...InboxItemFields
    }
  }
`;
