import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveDraftViewForRecordTableWidget = (
  pageLayoutId: string,
) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const removeDraftViewForRecordTableWidget = useCallback(
    (widgetId: string) => {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const { [widgetId]: _, ...rest } = prev;
        return rest;
      });
    },
    [store, recordTableWidgetViewDraftState],
  );

  return { removeDraftViewForRecordTableWidget };
};
