import { useCallback } from 'react';

import { aiChatThreadRecordUpdateCountState } from '@/ai-chat/threads/states/aiChatThreadRecordUpdateCountState';
import { type AiChatThreadUpdate } from '@/ai-chat/threads/types/AiChatThreadUpdate';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

export const useApplyAiChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const applyAiChatThreadUpdate = useCallback(
    (update: AiChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...update }],
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
