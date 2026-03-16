import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { isDefined } from 'twenty-shared/utils';

export const SeeDeletedRecordsNoSelectionRecordCommand = () => {
  const { objectMetadataItem, recordIndexId } =
    useMountedEngineCommandContext();

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
