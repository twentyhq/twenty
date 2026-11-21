import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAiChatThreadParticipants } from '@/ai-chat/threads/hooks/useAddAiChatThreadParticipants';
import { useFetchAiChatThreadsPage } from '@/ai-chat/threads/hooks/useFetchAiChatThreadsPage';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { mergeLoadedAiChatThread } from '@/ai-chat/threads/utils/mergeLoadedAiChatThread';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

export const useLoadAiChatThread = () => {
  const store = useStore();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { fetchAiChatThreadsPage } = useFetchAiChatThreadsPage();
  const { addAiChatThreadParticipants } = useAddAiChatThreadParticipants();

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadAiChatThread = useCallback(
    async (threadId: string) => {
      const page = await fetchAiChatThreadsPage({
        lastCursor: null,
        threadIdFilter: { id: { eq: threadId } },
      });

      if (!isDefined(page)) {
        return undefined;
      }

      const thread = page.threads[0];

      if (!isDefined(thread)) {
        return null;
      }

      await refreshAiChatThreadPermissions([thread.id]);

      const loadedThread = mergeLoadedAiChatThread({
        loadedThread: thread,
        storedThread: store.get(
          aiChatThreadRecordFamilySelector.selectorFamily(thread.id),
        ),
      });

      upsertRecordsInStore({
        partialRecords: [loadedThread],
      });
      addAiChatThreadParticipants(page.participants);

      return loadedThread;
    },
    [
      addAiChatThreadParticipants,
      fetchAiChatThreadsPage,
      refreshAiChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadAiChatThread };
};
