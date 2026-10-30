import { useEffect } from 'react';

import { aiActionStateFamilyState } from '@/ai/states/aiActionStateFamilyState';
import { aiActionWatchedIdsState } from '@/ai/states/aiActionWatchedIdsState';
import { type AiActionStateEntry } from '@/ai/types/AiActionStateEntry';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Registers the card with the shared poller for as long as it is mounted.
export const useAiActionState = (
  actionRequestId: string,
): AiActionStateEntry => {
  const setAiActionWatchedIds = useSetAtomState(aiActionWatchedIdsState);

  useEffect(() => {
    setAiActionWatchedIds((aiActionWatchedIds) => ({
      ...aiActionWatchedIds,
      [actionRequestId]: (aiActionWatchedIds[actionRequestId] ?? 0) + 1,
    }));

    return () => {
      setAiActionWatchedIds((aiActionWatchedIds) => {
        const { [actionRequestId]: count = 0, ...others } = aiActionWatchedIds;

        return count > 1 ? { ...others, [actionRequestId]: count - 1 } : others;
      });
    };
  }, [actionRequestId, setAiActionWatchedIds]);

  return useAtomFamilyStateValue(aiActionStateFamilyState, actionRequestId);
};
