import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { buildMissingRecordTableWidgetViewDraftSnapshots } from '@/page-layout/widgets/record-table/utils/buildMissingRecordTableWidgetViewDraftSnapshots';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useStore } from 'jotai';
import { useEffect } from 'react';

// The draft is every widget view setting's write target, including the side panel's, which can't seed it.
export const useInitializeRecordTableWidgetViewDrafts = () => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
  );

  const views = useAtomStateValue(viewsSelector);

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
  );

  const recordTableWidgetViewPersistedState =
    useAtomComponentStateCallbackState(
      recordTableWidgetViewPersistedComponentState,
    );

  const store = useStore();

  useEffect(() => {
    if (!isPageLayoutInEditMode) {
      return;
    }

    const missingSnapshotsByWidgetId =
      buildMissingRecordTableWidgetViewDraftSnapshots({
        widgets: pageLayoutDraft.tabs.flatMap((tab) => tab.widgets),
        existingSnapshotsByWidgetId: store.get(recordTableWidgetViewDraftState),
        views,
      });

    if (Object.keys(missingSnapshotsByWidgetId).length === 0) {
      return;
    }

    // Entries added elsewhere meanwhile win over the fresh snapshots.
    store.set(recordTableWidgetViewDraftState, (previousSnapshots) => ({
      ...missingSnapshotsByWidgetId,
      ...previousSnapshots,
    }));
    store.set(recordTableWidgetViewPersistedState, (previousSnapshots) => ({
      ...missingSnapshotsByWidgetId,
      ...previousSnapshots,
    }));
  }, [
    isPageLayoutInEditMode,
    pageLayoutDraft,
    views,
    recordTableWidgetViewDraftState,
    recordTableWidgetViewPersistedState,
    store,
  ]);
};
