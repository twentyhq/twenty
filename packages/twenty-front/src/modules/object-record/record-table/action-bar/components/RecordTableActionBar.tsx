import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';
import { useViewStates } from '@/views/hooks/internal/useViewStates';

export const RecordTableActionBar = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const {
    selectedRowIdsSelector,
    tableRowIdsState,
    hasUserSelectedAllRowsState,
  } = useRecordTableStates(recordTableId);

  const { entityCountInCurrentViewState } = useViewStates(recordTableId);
  const entityCountInCurrentView = useRecoilValue(
    entityCountInCurrentViewState,
  );
  const hasUserSelectedAllRows = useRecoilValue(hasUserSelectedAllRowsState);
  const tableRowIds = useRecoilValue(tableRowIdsState);
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const totalNumberOfSelectedRecords =
    hasUserSelectedAllRows && entityCountInCurrentView
      ? selectedRowIds.length === tableRowIds.length
        ? entityCountInCurrentView
        : entityCountInCurrentView -
          (tableRowIds.length - selectedRowIds.length) // unselected row Ids
      : selectedRowIds.length;

  if (!selectedRowIds.length) {
    return null;
  }

  return (
    <ActionBar
      selectedIds={selectedRowIds}
      totalNumberOfSelectedRecords={totalNumberOfSelectedRecords}
    />
  );
};
