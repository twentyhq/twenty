import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { GetChatThreadsDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatThreads = () => {
  const client = useApolloClient();
  const store = useStore();
  const { addToDraft, replaceDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const refreshAgentChatThreads = useCallback(async () => {
    const result = await client
      .query({
        query: GetChatThreadsDocument,
        fetchPolicy: 'network-only',
      })
      .catch(() => undefined);

    const agentChatThreads = result?.data?.chatThreads;
    const storeEntry = store.get(
      metadataStoreState.atomFamily('agentChatThreads'),
    );

    if (!isDefined(agentChatThreads)) {
      if (storeEntry.status === 'empty') {
        replaceDraft('agentChatThreads', []);
        applyChanges();
      }

      return undefined;
    }

    const storedThreads = (
      storeEntry.status === 'draft-pending'
        ? storeEntry.draft
        : storeEntry.current
    ) as FlatAgentChatThread[];
    const storedThreadIds = new Set(storedThreads.map((thread) => thread.id));

    // This request can race with subscription updates, so keep every thread
    // already present in the latest store snapshot.
    const missingThreads = agentChatThreads.filter(
      (thread) => !storedThreadIds.has(thread.id),
    );

    if (missingThreads.length > 0) {
      addToDraft({ key: 'agentChatThreads', items: missingThreads });
      applyChanges();
    } else if (storeEntry.status === 'empty') {
      replaceDraft('agentChatThreads', []);
      applyChanges();
    }

    return agentChatThreads;
  }, [client, store, addToDraft, replaceDraft, applyChanges]);

  return { refreshAgentChatThreads };
};
