import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateViewKanbanColumnWidth = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();

  const updateViewKanbanColumnWidth = useCallback(
    async (kanbanColumnWidth: number) => {
      if (!canPersistChanges || !isDefined(contextStoreCurrentViewId)) {
        return;
      }

      await performViewAPIUpdate({
        id: contextStoreCurrentViewId,
        input: {
          kanbanColumnWidth,
        },
      });
    },
    [canPersistChanges, contextStoreCurrentViewId, performViewAPIUpdate],
  );

  return {
    updateViewKanbanColumnWidth,
  };
};
