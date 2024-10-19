import { IconFilterOff } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordTableEmptyStateSoftDelete = () => {
  const { objectMetadataItem, objectNameSingular, recordTableId } =
    useContext(RecordTableContext);

  const { deleteCombinedViewFilter } =
    useDeleteCombinedViewFilters(recordTableId);
  const { tableFiltersState } = useRecordTableStates(recordTableId);

  const tableFilters = useRecoilValue(tableFiltersState);

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: recordTableId,
  });

  const handleButtonClick = async () => {
    deleteCombinedViewFilter(
      tableFilters.find(
        (filter) =>
          filter.definition.label === 'Deleted' &&
          filter.operand === 'isNotEmpty',
      )?.id ?? '',
    );
    toggleSoftDeleteFilterState(false);
  };

  const objectLabel = useObjectLabel(objectMetadataItem);

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={'Remove Deleted filter'}
      subTitle={'No deleted records matching the filter criteria were found.'}
      title={`No Deleted ${objectLabel} found`}
      Icon={IconFilterOff}
      animatedPlaceholderType="noDeletedRecord"
      onClick={handleButtonClick}
    />
  );
};
