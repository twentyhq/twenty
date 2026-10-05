import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { getViewPersistTarget } from '@/object-record/record-table-widget/utils/getViewPersistTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewApiUpdate } from '@/views/hooks/internal/usePerformViewApiUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateViewKanbanColumnWidth = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );
  const { performViewApiUpdate } = usePerformViewApiUpdate();
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  const updateViewKanbanColumnWidth = useCallback(
    async (kanbanColumnWidth: number) => {
      const persistTarget = getViewPersistTarget(recordTableWidgetContext);

      if (persistTarget.target === 'none') {
        return;
      }

      if (persistTarget.target === 'pageLayoutDraft') {
        persistTarget.widgetContext.updateViewDraft({ kanbanColumnWidth });
        return;
      }

      if (!canPersistChanges || !isDefined(contextStoreCurrentViewId)) {
        return;
      }

      await performViewApiUpdate({
        id: contextStoreCurrentViewId,
        input: {
          kanbanColumnWidth,
        },
      });
    },
    [
      canPersistChanges,
      contextStoreCurrentViewId,
      performViewApiUpdate,
      recordTableWidgetContext,
    ],
  );

  return {
    updateViewKanbanColumnWidth,
  };
};
