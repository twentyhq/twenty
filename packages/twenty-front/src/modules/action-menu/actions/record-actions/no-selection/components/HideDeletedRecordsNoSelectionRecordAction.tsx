import { Action } from '@/action-menu/actions/components/Action';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const HideDeletedRecordsNoSelectionRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!currentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    currentViewId,
  );

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular: objectMetadataItem.nameSingular,
    viewBarId: recordIndexId,
  });

  const { isRecordFilterAboutSoftDelete } = useCheckIsSoftDeleteFilter();

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const deletedFilter = currentRecordFilters.find(
    isRecordFilterAboutSoftDelete,
  );

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleClick = () => {
    if (!isDefined(deletedFilter)) {
      return;
    }

    removeRecordFilter({ recordFilterId: deletedFilter.id });
    toggleSoftDeleteFilterState(false);
  };

  return <Action onClick={handleClick} />;
};
