import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateViewKanbanColumnWidth = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  const updateViewKanbanColumnWidth = useCallback(
    async (kanbanColumnWidth: number) => {
      if (isDefined(recordTableWidgetContext)) {
        if (
          !recordTableWidgetContext.isPageLayoutInEditMode ||
          !isDefined(recordTableWidgetContext.pageLayoutId)
        ) {
          return;
        }

        recordTableWidgetContext.updateViewDraft({ kanbanColumnWidth });
        return;
      }

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
    [
      canPersistChanges,
      contextStoreCurrentViewId,
      performViewAPIUpdate,
      recordTableWidgetContext,
    ],
  );

  return {
    updateViewKanbanColumnWidth,
  };
};
