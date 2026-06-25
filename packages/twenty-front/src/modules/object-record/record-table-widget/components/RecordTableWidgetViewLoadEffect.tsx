import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { lastLoadedRecordTableWidgetViewIdComponentState } from '@/object-record/record-table-widget/states/lastLoadedRecordTableWidgetViewIdComponentState';
import { computeRecordTableWidgetViewLoadContentSignature } from '@/object-record/record-table-widget/utils/computeRecordTableWidgetViewLoadContentSignature';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { recordTableWidgetViewDraftByWidgetIdComponentFamilySelector } from '@/page-layout/states/selectors/recordTableWidgetViewDraftByWidgetIdComponentFamilySelector';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useEffect } from 'react';
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

  const draftSnapshot = useAtomComponentFamilySelectorValue(
    recordTableWidgetViewDraftByWidgetIdComponentFamilySelector,
    { widgetId },
  );

  const viewFromDraft =
    isPageLayoutInEditMode && isDefined(draftSnapshot)
      ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
      : undefined;

  const viewFromSelector = useAtomFamilySelectorValue(
    viewFromViewIdFamilySelector,
    { viewId },
  );

  const currentView = viewFromDraft ?? viewFromSelector;

  const viewHasFields =
    isDefined(currentView) && currentView.viewFields.length > 0;

  // eslint-disable-next-line no-console
  console.log(
    '[REL_TABLE_DEBUG] 4.RecordTableWidgetViewLoadEffect render',
    JSON.stringify({
      widgetId,
      viewId,
      isPageLayoutInEditMode,
      hasDraftSnapshot: isDefined(draftSnapshot),
      draftViewFieldsCount: draftSnapshot?.viewFields?.length ?? null,
      hasViewFromDraft: isDefined(viewFromDraft),
      hasViewFromSelector: isDefined(viewFromSelector),
      hasCurrentView: isDefined(currentView),
      currentViewFieldsCount: currentView?.viewFields?.length ?? null,
      viewHasFields,
    }),
  );

  useEffect(() => {
    if (!isDefined(currentView)) {
      // eslint-disable-next-line no-console
      console.log(
        '[REL_TABLE_DEBUG] 4a.viewLoadEffect SKIP: no currentView',
        JSON.stringify({ widgetId, viewId }),
      );
      return;
    }

    if (!viewHasFields) {
      // eslint-disable-next-line no-console
      console.log(
        '[REL_TABLE_DEBUG] 4b.viewLoadEffect SKIP: currentView has no viewFields',
        JSON.stringify({ widgetId, viewId }),
      );
      return;
    }

    const contentSignature =
      computeRecordTableWidgetViewLoadContentSignature(currentView);

    const lastLoadedMatches =
      viewId === lastLoadedRecordTableWidgetViewId?.viewId &&
      objectMetadataItem.updatedAt ===
        lastLoadedRecordTableWidgetViewId?.objectMetadataItemUpdatedAt &&
      contentSignature ===
        lastLoadedRecordTableWidgetViewId?.loadedViewContentSignature;

    if (lastLoadedMatches) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      '[REL_TABLE_DEBUG] 4c.viewLoadEffect -> loadRecordIndexStates FIRES',
      JSON.stringify({
        widgetId,
        viewId,
        viewFieldsCount: currentView.viewFields.length,
      }),
    );

    loadRecordIndexStates(currentView, objectMetadataItem, {
      skipGlobalIndexStates: true,
    });

    setLastLoadedRecordTableWidgetViewId({
      viewId,
      objectMetadataItemUpdatedAt: objectMetadataItem.updatedAt,
      loadedViewContentSignature: contentSignature,
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
