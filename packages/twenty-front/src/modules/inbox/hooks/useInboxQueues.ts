import { useQuery } from '@apollo/client/react';

import { INBOX_ITEMS_POLL_INTERVAL } from '@/inbox/constants/InboxItemsPollInterval';
import { GET_MY_INBOX_QUEUES } from '@/inbox/graphql/queries/getMyInboxQueues';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { shouldSkipInboxPoll } from '@/inbox/utils/shouldSkipInboxPoll';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxQueue } from '~/generated/graphql';

// The shared inboxes this person can reach. Access is resolved server
// side, so the navigation simply renders what comes back.
export const useInboxQueues = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();

  const { data, loading } = useQuery<{ myInboxQueues: InboxQueue[] }>(
    GET_MY_INBOX_QUEUES,
    {
      client: apolloCoreClient,
      pollInterval: INBOX_ITEMS_POLL_INTERVAL,
      skipPollAttempt: shouldSkipInboxPoll,
      skip: !isInboxEnabled,
    },
  );

  return { inboxQueues: data?.myInboxQueues ?? [], loading };
};
