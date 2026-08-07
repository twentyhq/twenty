import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { INBOX_ITEMS_PAGE_SIZE } from '@/inbox/constants/InboxItemsPageSize';
import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_ITEMS } from '@/inbox/graphql/queries/getMyInboxItems';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { sortInboxItemsByUpdatedAtDesc } from '@/inbox/utils/sortInboxItemsByUpdatedAtDesc';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type InboxItem,
  InboxItemPriority,
  type InboxItemScope,
} from '~/generated/graphql';

// Older items are reached by growing the page rather than by an offset cursor,
// so the polling that keeps this list live cannot fight the pagination.
export const useInboxItems = (scope?: InboxItemScope) => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();
  const [limit, setLimit] = useState(INBOX_ITEMS_PAGE_SIZE);

  const { data, loading, error, refetch } = useQuery<
    { myInboxItems: InboxItem[] },
    { scope?: InboxItemScope; limit: number }
  >(GET_MY_INBOX_ITEMS, {
    client: apolloCoreClient,
    variables: { scope, limit },
    pollInterval: INBOX_ITEMS_POLL_INTERVAL,
    skip: !isInboxEnabled,
  });

  const inboxItems = sortInboxItemsByUpdatedAtDesc(data?.myInboxItems ?? []);

  const loadMoreItems = () => {
    setLimit((currentLimit) => currentLimit + INBOX_ITEMS_PAGE_SIZE);
  };

  return {
    needsActionItems: inboxItems.filter(
      (inboxItem) => inboxItem.priority === InboxItemPriority.NEEDS_ACTION,
    ),
    otherItems: inboxItems.filter(
      (inboxItem) => inboxItem.priority !== InboxItemPriority.NEEDS_ACTION,
    ),
    isInboxEnabled,
    hasMoreItems: inboxItems.length >= limit,
    loadMoreItems,
    loading,
    error,
    refetch,
  };
};
