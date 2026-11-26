import { useCallback } from 'react';

import { aiChatThreadRecordUpdateCountState } from '@/ai-chat/threads/states/aiChatThreadRecordUpdateCountState';
import { type AiChatThreadUpdate } from '@/ai-chat/threads/types/AiChatThreadUpdate';
import { inboxObjectNamesSelector } from '@/ai-chat/states/selectors/inboxObjectNamesSelector';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

export const useApplyAiChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const applyAiChatThreadUpdate = useCallback(
    (update: AiChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [
          {
            __typename: getObjectTypename(
              store.get(inboxObjectNamesSelector.atom).agentChatThread,
            ),
            ...update,
          },
        ],
      });
      store.set(
        aiChatThreadRecordUpdateCountState.atom,
        (updateCount) => updateCount + 1,
      );
    },
    [store, upsertRecordsInStore],
  );

  return { applyAiChatThreadUpdate };
};
