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
    hasUserSelectedAllRowState,
  } = useRecordTableStates(recordTableId);

  const { entityCountInCurrentViewState } = useViewStates(recordTableId);
  const entityCountInCurrentView = useRecoilValue(
    entityCountInCurrentViewState,
  );
  const hasUserSelectedAllRow = useRecoilValue(hasUserSelectedAllRowState);
  const tableRowIds = useRecoilValue(tableRowIdsState);
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector());

  const numSelected =
    hasUserSelectedAllRow && selectedRowIds.length === tableRowIds.length
      ? entityCountInCurrentView
      : undefined;

  if (!selectedRowIds.length) {
    return null;
  }

  return <ActionBar selectedIds={selectedRowIds} numSelected={numSelected} />;
};
