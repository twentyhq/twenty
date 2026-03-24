import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { isDefined } from 'twenty-shared/utils';

export const SeeDeletedRecordsNoSelectionRecordCommand = () => {
  const { objectMetadataItem, recordIndexId } = useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to see deleted records',
    );
  }

  const { handleToggleTrashColumnFilter, toggleSoftDeleteFilterState } =
    useHandleToggleTrashColumnFilter({
      objectNameSingular: objectMetadataItem.nameSingular,
      viewBarId: recordIndexId,
      recordFiltersInstanceId: recordIndexId,
    });

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => {
        handleToggleTrashColumnFilter();
        toggleSoftDeleteFilterState(true);
      }}
    />
  );
};
