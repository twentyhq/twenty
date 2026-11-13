import { useEffect } from 'react';

import { useTargetAiChatThreadsInContextStore } from '@/ai/hooks/useTargetAiChatThreadsInContextStore';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

type InboxSelectionToContextStoreEffectProps = {
  contextStoreInstanceId: string;
};

export const InboxSelectionToContextStoreEffect = ({
  contextStoreInstanceId,
}: InboxSelectionToContextStoreEffectProps) => {
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const { targetAiChatThreadsInContextStore } =
    useTargetAiChatThreadsInContextStore();

  useEffect(() => {
    targetAiChatThreadsInContextStore({
      contextStoreInstanceId,
      threadIds: selectedRecordIds,
    });

    return () => {
      targetAiChatThreadsInContextStore({
        contextStoreInstanceId,
        threadIds: [],
      });
    };
  }, [
    contextStoreInstanceId,
    selectedRecordIds,
    targetAiChatThreadsInContextStore,
  ]);

  return null;
};
