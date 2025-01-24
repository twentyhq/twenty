import { IconFilterOff } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';

export const RecordTableEmptyStateSoftDelete = () => {
  const { objectMetadataItem, objectNameSingular, recordTableId } =
    useRecordTableContextOrThrow();

  const { deleteCombinedViewFilter } =
    useDeleteCombinedViewFilters(recordTableId);

  const tableFilters = useRecoilComponentValueV2(
    tableFiltersComponentState,
    recordTableId,
  );

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: recordTableId,
  });

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleButtonClick = async () => {
    const deletedFilter = tableFilters.find(
      (filter) =>
        filter.definition.label === 'Deleted' &&
        filter.operand === 'isNotEmpty',
    );

    if (!deletedFilter) {
      throw new Error('Deleted filter not found');
    }

    removeRecordFilter(deletedFilter.fieldMetadataId);
    deleteCombinedViewFilter(deletedFilter.id);

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
