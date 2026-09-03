import { useQuery } from '@apollo/client/react';

import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_COUNTS } from '@/inbox/graphql/queries/getMyInboxCounts';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { shouldSkipInboxPoll } from '@/inbox/utils/shouldSkipInboxPoll';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxCounts } from '~/generated/graphql';

export const useInboxCounts = (queueSlug?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();

  const { data, loading, error } = useQuery<
    { myInboxCounts: InboxCounts },
    { queueSlug?: string }
  >(GET_MY_INBOX_COUNTS, {
    client: apolloCoreClient,
    variables: { queueSlug },
    pollInterval: INBOX_ITEMS_POLL_INTERVAL,
    skipPollAttempt: shouldSkipInboxPoll,
    skip: !isInboxEnabled,
  });

  return {
    inboxCounts: data?.myInboxCounts ?? null,
    loading,
    error,
  };
};
