import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';
import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { entityCountInCurrentViewInstanceState } from '@/views/states/entityCountInCurrentViewInstanceState';

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

  // TODO: verify this instance id works
  const entityCountInCurrentView = useRecoilInstanceValue(
    entityCountInCurrentViewInstanceState,
    recordTableId,
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
