import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getAiChatThreadRollbackUpdate } from '@/ai-chat/threads/utils/getAiChatThreadRollbackUpdate';

export const useApplyOptimisticAiChatThreadUpdate = () => {
  const store = useStore();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();

  const applyOptimisticAiChatThreadUpdate = useCallback(
    (update: Partial<AiChatThreadRecord> & { id: string }) => {
      const getThread = () =>
        store.get(aiChatThreadRecordFamilySelector.selectorFamily(update.id));
      const previousThread = getThread();

      applyAiChatThreadUpdate(update);

      const rollback = () => {
        const rollbackUpdate = getAiChatThreadRollbackUpdate({
          optimisticUpdate: update,
          previousThread,
          currentThread: getThread(),
        });

        if (isDefined(rollbackUpdate)) {
          applyAiChatThreadUpdate(rollbackUpdate);
        }
      };

      return { rollback };
    },
    [applyAiChatThreadUpdate, store],
  );

  return { applyOptimisticAiChatThreadUpdate };
};
