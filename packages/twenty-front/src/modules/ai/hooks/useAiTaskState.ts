import { useEffect } from 'react';

import { aiTaskStateFamilyState } from '@/ai/states/aiTaskStateFamilyState';
import { aiTaskWatchedIdsState } from '@/ai/states/aiTaskWatchedIdsState';
import { type AiTaskStateEntry } from '@/ai/types/AiTaskStateEntry';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Registers the card with the shared poller for as long as it is mounted.
export const useAiTaskState = (taskId: string): AiTaskStateEntry => {
  const setAiTaskWatchedIds = useSetAtomState(aiTaskWatchedIdsState);

  useEffect(() => {
    setAiTaskWatchedIds((aiTaskWatchedIds) => ({
      ...aiTaskWatchedIds,
      [taskId]: (aiTaskWatchedIds[taskId] ?? 0) + 1,
    }));

    return () => {
      setAiTaskWatchedIds((aiTaskWatchedIds) => {
        const { [taskId]: count = 0, ...others } = aiTaskWatchedIds;

        return count > 1 ? { ...others, [taskId]: count - 1 } : others;
      });
    };
  }, [taskId, setAiTaskWatchedIds]);

  return useAtomFamilyStateValue(aiTaskStateFamilyState, taskId);
};
