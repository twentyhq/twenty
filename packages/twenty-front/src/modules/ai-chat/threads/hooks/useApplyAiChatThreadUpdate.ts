import { useCallback } from 'react';

import { aiChatThreadRecordUpdateCountState } from '@/ai-chat/threads/states/aiChatThreadRecordUpdateCountState';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

type AiChatThreadUpdate = Partial<AiChatThreadRecord> & {
  id: string;
};

export const useApplyAiChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  // A list page requested before this update must not overwrite it
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
