import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { GetChatThreadsDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatThreads = () => {
  const client = useApolloClient();
  const store = useStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const refreshAgentChatThreads = useCallback(async () => {
    const workspaceId = store.get(currentWorkspaceState.atom)?.id;
    const userWorkspace = store.get(currentUserWorkspaceState.atom);
    const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
    for (let attempt = 0; attempt < 2; attempt++) {
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

      if (
        !isDefined(agentChatThreads) ||
        store.get(currentWorkspaceState.atom)?.id !== workspaceId ||
        store.get(currentWorkspaceMemberState.atom)?.id !== workspaceMemberId ||
        store.get(currentUserWorkspaceState.atom) !== userWorkspace
      ) {
        return undefined;
      }

      // Retry once rather than overwrite newer subscription updates. Continuous
      // streaming must not keep a refresh alive indefinitely.
      if (
        store.get(metadataStoreState.atomFamily('agentChatThreads')) !==
        storeEntryBeforeRequest
      ) {
        continue;
      }

      const selectedThreadId = store.get(currentAiChatThreadState.atom);
      await refreshAgentChatThreadPermissions([
        ...agentChatThreads.map(({ id }) => id),
        ...(isDefined(selectedThreadId) && isValidUuid(selectedThreadId)
          ? [selectedThreadId]
          : []),
      ]);
      if (
        store.get(currentWorkspaceState.atom)?.id !== workspaceId ||
        store.get(currentWorkspaceMemberState.atom)?.id !== workspaceMemberId ||
        store.get(currentUserWorkspaceState.atom) !== userWorkspace
      ) {
        return undefined;
      }
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
  }, [
    client,
    store,
    replaceDraft,
    applyChanges,
    refreshAgentChatThreadPermissions,
  ]);

  return { refreshAgentChatThreads };
};
