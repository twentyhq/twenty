import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
// so the polling that keeps this list live cannot fight the pagination. One
// extra item is requested to tell "exactly a full page" from "there is more".
export const useInboxItems = (scope?: InboxItemScope) => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();
  const [limit, setLimit] = useState(INBOX_ITEMS_PAGE_SIZE);

  const { data, loading, error, refetch } = useQuery<
    { myInboxItems: InboxItem[] },
    { scope?: InboxItemScope; limit: number }
  >(GET_MY_INBOX_ITEMS, {
    client: apolloCoreClient,
    variables: { scope, limit: limit + 1 },
    pollInterval: INBOX_ITEMS_POLL_INTERVAL,
    skip: !isInboxEnabled,
  });

  const fetchedItems = sortInboxItemsByUpdatedAtDesc(data?.myInboxItems ?? []);
  const hasMoreItems = fetchedItems.length > limit;
  const inboxItems = fetchedItems.slice(0, limit);

  const loadMoreItems = () => {
    setLimit((currentLimit) => currentLimit + INBOX_ITEMS_PAGE_SIZE);
  };

  return {
    inboxItems,
    needsActionItems: inboxItems.filter(
      (inboxItem) => inboxItem.priority === InboxItemPriority.NEEDS_ACTION,
    ),
    otherItems: inboxItems.filter(
      (inboxItem) => inboxItem.priority !== InboxItemPriority.NEEDS_ACTION,
    ),
    isInboxEnabled,
    hasMoreItems,
    loadMoreItems,
    // Polling leaves loading false, but a scope change refetches with no data
    isInitialLoading: loading && !isDefined(data),
    loading,
    error,
    refetch,
  };
};
