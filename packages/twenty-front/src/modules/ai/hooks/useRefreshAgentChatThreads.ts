import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { GetChatThreadsDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatThreads = () => {
  const client = useApolloClient();
  const store = useStore();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const refreshAgentChatThreads = useCallback(async () => {
    while (true) {
      const storeEntryBeforeRequest = store.get(
        metadataStoreState.atomFamily('agentChatThreads'),
      );
      const result = await client
        .query({
          query: GetChatThreadsDocument,
          fetchPolicy: 'network-only',
        })
        .catch(() => undefined);

      const agentChatThreads = result?.data?.chatThreads;

      if (!isDefined(agentChatThreads)) {
        return undefined;
      }

      // Retry with a fresh server snapshot when a local or subscription update
      // arrives during the request.
      if (
        store.get(metadataStoreState.atomFamily('agentChatThreads')) !==
        storeEntryBeforeRequest
      ) {
        continue;
      }

      replaceDraft('agentChatThreads', agentChatThreads);
      applyChanges();

      return agentChatThreads;
    }
  }, [client, store, replaceDraft, applyChanges]);

  return { refreshAgentChatThreads };
};
