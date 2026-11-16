import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAiChatThreadParticipants } from '@/ai/hooks/useAddAiChatThreadParticipants';
import { AI_CHAT_THREAD_LOADED_EVENT_NAME } from '@/ai/constants/AiChatThreadLoadedEventName';
import { useFetchAiChatThreadsPage } from '@/ai/hooks/useFetchAiChatThreadsPage';
import { useRefreshAiChatThreadPermissions } from '@/ai/hooks/useRefreshAiChatThreadPermissions';
import { aiChatUsageFamilyState } from '@/ai/states/aiChatUsageFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadLoadedEventDetail } from '@/ai/types/AiChatThreadLoadedEventDetail';
import { mergeLoadedAiChatThread } from '@/ai/utils/mergeLoadedAiChatThread';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getAiChatUsageFromThread } from '@/ai/utils/getAiChatUsageFromThread';

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
      dispatchBrowserEvent<AiChatThreadLoadedEventDetail>(
        AI_CHAT_THREAD_LOADED_EVENT_NAME,
        { threadId: loadedThread.id },
      );
      addAiChatThreadParticipants(page.participants);

      const usageAtom = aiChatUsageFamilyState.atomFamily({
        threadId: thread.id,
      });

      if (!isDefined(store.get(usageAtom))) {
        store.set(usageAtom, getAiChatUsageFromThread(loadedThread));
      }

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
