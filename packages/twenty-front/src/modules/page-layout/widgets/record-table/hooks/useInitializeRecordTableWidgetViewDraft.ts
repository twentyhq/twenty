import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { buildRecordTableWidgetViewSnapshotFromView } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshotFromView';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { type View } from '@/views/types/View';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';

type UseInitializeRecordTableWidgetViewDraftParams = {
  widgetId: string;
  view: View | undefined;
};

export const useInitializeRecordTableWidgetViewDraft = ({
  widgetId,
  view,
}: UseInitializeRecordTableWidgetViewDraftParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
  );

  const recordTableWidgetViewPersistedState =
    useAtomComponentStateCallbackState(
      recordTableWidgetViewPersistedComponentState,
    );

  const store = useStore();

  const initializeDraft = useCallback(() => {
    const currentDraft = store.get(recordTableWidgetViewDraftState);

    if (widgetId in currentDraft) {
      return;
    }

    if (!view || view.viewFields.length === 0) {
      return;
    }

    const snapshot = buildRecordTableWidgetViewSnapshotFromView(view);

    store.set(recordTableWidgetViewDraftState, (prev) => ({
      ...prev,
      [widgetId]: snapshot,
    }));

    store.set(recordTableWidgetViewPersistedState, (prev) => ({
      ...prev,
      [widgetId]: snapshot,
    }));
  }, [
    recordTableWidgetViewDraftState,
    recordTableWidgetViewPersistedState,
    widgetId,
    view,
    store,
  ]);

  useEffect(initializeDraft, [initializeDraft]);
};
