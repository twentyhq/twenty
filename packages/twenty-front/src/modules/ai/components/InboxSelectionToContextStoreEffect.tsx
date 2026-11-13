import { useEffect } from 'react';

import { useTargetInboxThreadsInContextStore } from '@/ai/hooks/useTargetInboxThreadsInContextStore';
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
  const { targetInboxThreadsInContextStore } =
    useTargetInboxThreadsInContextStore();

  useEffect(() => {
    targetInboxThreadsInContextStore({
      contextStoreInstanceId,
      threadIds: selectedRecordIds,
    });

    return () => {
      targetInboxThreadsInContextStore({
        contextStoreInstanceId,
        threadIds: [],
      });
    };
  }, [
    contextStoreInstanceId,
    selectedRecordIds,
    targetInboxThreadsInContextStore,
  ]);

  return null;
};
