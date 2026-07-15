import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { lastLoadedRecordTableWidgetViewIdComponentState } from '@/object-record/record-table-widget/states/lastLoadedRecordTableWidgetViewIdComponentState';
import { computeRecordTableWidgetViewLoadContentSignature } from '@/object-record/record-table-widget/utils/computeRecordTableWidgetViewLoadContentSignature';
import { RecordTableWidgetViewContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetViewContext';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableWidgetViewLoadEffectProps = {
  viewId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const RecordTableWidgetViewLoadEffect = ({
  viewId,
  objectMetadataItem,
}: RecordTableWidgetViewLoadEffectProps) => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const [
    lastLoadedRecordTableWidgetViewId,
    setLastLoadedRecordTableWidgetViewId,
  ] = useAtomComponentState(lastLoadedRecordTableWidgetViewIdComponentState);

  const { currentView } = useContext(RecordTableWidgetViewContext) ?? {
    currentView: undefined,
  };

  const viewHasFields =
    isDefined(currentView) && currentView.viewFields.length > 0;

  useEffect(() => {
    if (!isDefined(currentView)) {
      return;
    }

    if (!viewHasFields) {
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
