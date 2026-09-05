import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_ITEMS_PAGE_SIZE } from '@/inbox/constants/InboxItemsPageSize';
import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_ITEMS } from '@/inbox/graphql/queries/getMyInboxItems';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { shouldSkipInboxPoll } from '@/inbox/utils/shouldSkipInboxPoll';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type InboxItem,
  type InboxItemScope,
  type InboxQueueAssignment,
} from '~/generated/graphql';

// Older items are reached by growing the page rather than by an offset cursor,
// so the polling that keeps this list live cannot fight the pagination. One
// extra item is requested to tell "exactly a full page" from "there is more".
export const useInboxItems = (
  scope?: InboxItemScope,
  queueSlug?: string,
  assignment?: InboxQueueAssignment,
) => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();
  // The grown page belongs to one view, so switching section, queue or
  // assignment starts again from the first page.
  const viewKey = `${scope ?? ''}|${queueSlug ?? ''}|${assignment ?? ''}`;
  const [pagination, setPagination] = useState({
    viewKey,
    limit: INBOX_ITEMS_PAGE_SIZE,
  });

  // Reset during render rather than in an effect, so coming back to a view
  // later starts from the first page instead of restoring its grown one.
  if (pagination.viewKey !== viewKey) {
    setPagination({ viewKey, limit: INBOX_ITEMS_PAGE_SIZE });
  }

  const limit =
    pagination.viewKey === viewKey ? pagination.limit : INBOX_ITEMS_PAGE_SIZE;

  const { data, loading, error } = useQuery<
    { myInboxItems: InboxItem[] },
    {
      scope?: InboxItemScope;
      queueSlug?: string;
      assignment?: InboxQueueAssignment;
      limit: number;
    }
  >(GET_MY_INBOX_ITEMS, {
    client: apolloCoreClient,
    variables: { scope, queueSlug, assignment, limit: limit + 1 },
    pollInterval: INBOX_ITEMS_POLL_INTERVAL,
    skipPollAttempt: shouldSkipInboxPoll,
    skip: !isInboxEnabled,
  });

  // Already ordered by lastEventAt desc by the server, which is also the order
  // the extra-item check assumes.
  const fetchedItems = data?.myInboxItems ?? [];
  const hasMoreItems = fetchedItems.length > limit;
  const inboxItems = fetchedItems.slice(0, limit);

  const loadMoreItems = () => {
    setPagination({ viewKey, limit: limit + INBOX_ITEMS_PAGE_SIZE });
  };

  return {
    inboxItems,
    isInboxEnabled,
    hasMoreItems,
    loadMoreItems,
    // Polling leaves loading false, but a scope change refetches with no data.
    isInitialLoading: loading && !isDefined(data),
    error,
  };
};
