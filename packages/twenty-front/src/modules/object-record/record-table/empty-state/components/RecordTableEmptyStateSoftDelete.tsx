import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isDefined } from 'twenty-shared/utils';
import { IconFilterOff } from 'twenty-ui/display';

export const RecordTableEmptyStateSoftDelete = () => {
  const { objectMetadataItem, objectNameSingular, recordTableId } =
    useRecordTableContextOrThrow();

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: recordTableId,
  });

  const { removeRecordFilter } = useRemoveRecordFilter();

  const { checkIsSoftDeleteFilter } = useCheckIsSoftDeleteFilter();

  const handleButtonClick = async () => {
    const deletedFilter = currentRecordFilters.find(checkIsSoftDeleteFilter);

    if (!isDefined(deletedFilter)) {
      throw new Error('Deleted filter not found');
    }

    removeRecordFilter({ recordFilterId: deletedFilter.id });

    toggleSoftDeleteFilterState(false);
  };

  const objectLabel = useObjectLabel(objectMetadataItem);

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={'Remove Deleted filter'}
      subTitle={'No deleted records matching the filter criteria were found.'}
      title={`No Deleted ${objectLabel} found`}
      ButtonIcon={IconFilterOff}
      animatedPlaceholderType="noDeletedRecord"
      onClick={handleButtonClick}
    />
  );
};
