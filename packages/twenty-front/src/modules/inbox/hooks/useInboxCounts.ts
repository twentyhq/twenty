import { useQuery } from '@apollo/client/react';

import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_COUNTS } from '@/inbox/graphql/queries/getMyInboxCounts';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxCounts } from '~/generated/graphql';

export const useInboxCounts = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();

  const { data, loading, error } = useQuery<{ myInboxCounts: InboxCounts }>(
    GET_MY_INBOX_COUNTS,
    {
      client: apolloCoreClient,
      pollInterval: INBOX_ITEMS_POLL_INTERVAL,
      skip: !isInboxEnabled,
    },
  );

  return {
    inboxCounts: data?.myInboxCounts ?? null,
    loading,
    error,
  };
};
