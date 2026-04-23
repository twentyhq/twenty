import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { lastLoadedRecordTableWidgetViewIdComponentState } from '@/object-record/record-table-widget/states/lastLoadedRecordTableWidgetViewIdComponentState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableWidgetViewLoadEffectProps = {
  viewId: string;
  widgetId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const RecordTableWidgetViewLoadEffect = ({
  viewId,
  widgetId,
  objectMetadataItem,
}: RecordTableWidgetViewLoadEffectProps) => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const [
    lastLoadedRecordTableWidgetViewId,
    setLastLoadedRecordTableWidgetViewId,
  ] = useAtomComponentState(lastLoadedRecordTableWidgetViewIdComponentState);

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
  );

  const draftSnapshot = recordTableWidgetViewDraft[widgetId];

  const viewFromDraft = useMemo(
    () =>
      isPageLayoutInEditMode && isDefined(draftSnapshot)
        ? {
            ...draftSnapshot.view,
            viewFields: draftSnapshot.viewFields,
            viewFilters: [],
            viewSorts: [],
            viewGroups: [],
            viewFilterGroups: [],
          }
        : undefined,
    [isPageLayoutInEditMode, draftSnapshot],
  );

  const viewFromSelector = useAtomFamilySelectorValue(
    viewFromViewIdFamilySelector,
    { viewId },
  );

  const currentView = viewFromDraft ?? viewFromSelector;

  const viewHasFields =
    isDefined(currentView) && currentView.viewFields.length > 0;

  useEffect(() => {
    if (!isDefined(currentView)) {
      return;
    }

    if (!viewHasFields) {
      return;
    }

    if (
      viewId === lastLoadedRecordTableWidgetViewId?.viewId &&
      objectMetadataItem.updatedAt ===
        lastLoadedRecordTableWidgetViewId?.objectMetadataItemUpdatedAt
    ) {
      return;
    }

    loadRecordIndexStates(currentView, objectMetadataItem);

    setLastLoadedRecordTableWidgetViewId({
      viewId,
      objectMetadataItemUpdatedAt: objectMetadataItem.updatedAt,
    });
  }, [
    viewId,
    lastLoadedRecordTableWidgetViewId,
    setLastLoadedRecordTableWidgetViewId,
    currentView,
    viewHasFields,
    objectMetadataItem,
    loadRecordIndexStates,
  ]);

  return null;
};
