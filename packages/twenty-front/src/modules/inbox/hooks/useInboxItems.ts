import { useQuery } from '@apollo/client/react';

import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_ITEMS } from '@/inbox/graphql/queries/getMyInboxItems';
import { sortInboxItemsByUpdatedAtDesc } from '@/inbox/utils/sortInboxItemsByUpdatedAtDesc';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type InboxItem,
  InboxItemPriority,
  type InboxItemScope,
} from '~/generated/graphql';

export const useInboxItems = (scope?: InboxItemScope) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery<
    { myInboxItems: InboxItem[] },
    { scope?: InboxItemScope }
  >(GET_MY_INBOX_ITEMS, {
    client: apolloCoreClient,
    variables: { scope },
    pollInterval: INBOX_ITEMS_POLL_INTERVAL,
  });

  const inboxItems = sortInboxItemsByUpdatedAtDesc(data?.myInboxItems ?? []);

  return {
    needsActionItems: inboxItems.filter(
      (inboxItem) => inboxItem.priority === InboxItemPriority.NEEDS_ACTION,
    ),
    otherItems: inboxItems.filter(
      (inboxItem) => inboxItem.priority !== InboxItemPriority.NEEDS_ACTION,
    ),
    loading,
    error,
    refetch,
  };
};
