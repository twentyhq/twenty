import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { lastLoadedRecordTableWidgetViewIdComponentState } from '@/object-record/record-table-widget/states/lastLoadedRecordTableWidgetViewIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useEffect } from 'react';
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

  const viewFromViewId = useAtomFamilySelectorValue(
    viewFromViewIdFamilySelector,
    {
      viewId,
    },
  );

  const viewHasFields =
    isDefined(viewFromViewId) && viewFromViewId.viewFields.length > 0;

  useEffect(() => {
    if (!isDefined(viewFromViewId)) {
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

    loadRecordIndexStates(viewFromViewId, objectMetadataItem);

    setLastLoadedRecordTableWidgetViewId({
      viewId,
      objectMetadataItemUpdatedAt: objectMetadataItem.updatedAt,
    });
  }, [
    viewId,
    lastLoadedRecordTableWidgetViewId,
    setLastLoadedRecordTableWidgetViewId,
    viewFromViewId,
    viewHasFields,
    objectMetadataItem,
    loadRecordIndexStates,
  ]);

  return null;
};
