import { useQuery } from '@apollo/client/react';

import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_INBOX_QUEUE_SETTINGS } from '@/settings/inbox/graphql/inboxSettingsOperations';
import { type InboxQueueSettings } from '~/generated/graphql';

// Split out of useInboxSettings so a component that only names a shared inbox
// does not also build the mutations for administering one.
export const useInboxQueueSettings = () => {
  const apolloCoreClient = useApolloCoreClient();

  // The query is flag-guarded server-side, so asking with the flag off is a
  // GraphQL error rather than an empty list.
  const isInboxFeatureEnabled = useIsInboxEnabled();

  const { data, loading } = useQuery<{
    inboxQueueSettings: InboxQueueSettings[];
  }>(GET_INBOX_QUEUE_SETTINGS, {
    client: apolloCoreClient,
    skip: !isInboxFeatureEnabled,
  });

  return {
    inboxQueues: data?.inboxQueueSettings ?? [],
    loading,
  };
};
