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

// Seeds the editable view snapshot of every widget backed by a persisted
// view as soon as the layout is in edit mode, and again whenever a widget
// gains a view (e.g. a field widget configured to table display) or views
// finish loading. The draft is the write target of all widget view settings,
// so it must exist before any of them run — including the ones in the side
// panel, which mounts outside this layout tree and cannot seed it itself.
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

    // Spread order lets entries added elsewhere in the meantime win over the
    // freshly built snapshots.
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
