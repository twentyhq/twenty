import { useQuery } from '@apollo/client/react';

import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_QUEUES } from '@/inbox/graphql/queries/getMyInboxQueues';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { shouldSkipInboxPoll } from '@/inbox/utils/shouldSkipInboxPoll';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxQueue } from '~/generated/graphql';

// Callers that stay mounted while the inbox is in use poll; the drawer is not
// one of them on mobile or while a navigation folder is open, so the inbox page
// polls as well.
export const useInboxQueues = ({
  isPolling = false,
}: { isPolling?: boolean } = {}) => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();

  const { data } = useQuery<{ myInboxQueues: InboxQueue[] }>(
    GET_MY_INBOX_QUEUES,
    {
      client: apolloCoreClient,
      pollInterval: isPolling ? INBOX_ITEMS_POLL_INTERVAL : undefined,
      skipPollAttempt: shouldSkipInboxPoll,
      skip: !isInboxEnabled,
    },
  );

  return { inboxQueues: data?.myInboxQueues ?? [] };
};
