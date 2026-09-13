import { gql } from '@apollo/client';

import { INBOX_ITEM_FRAGMENT } from '@/inbox/graphql/fragments/inboxItemFragment';

export const TRANSITION_INBOX_ITEM = gql`
  mutation TransitionInboxItem(
    $inboxItemId: UUID!
    $transition: TransitionInboxItemInput!
    $expectedVersion: Int
  ) {
    transitionInboxItem(
      inboxItemId: $inboxItemId
      transition: $transition
      expectedVersion: $expectedVersion
    ) {
      ...InboxItemFields
    }
  }
  ${INBOX_ITEM_FRAGMENT}
`;
