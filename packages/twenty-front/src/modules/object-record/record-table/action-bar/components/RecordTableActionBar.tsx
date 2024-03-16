import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { selectedRecordsComponentState } from '@/object-record/record-table/states/selectedRecordsComponentState';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

export const RecordTableActionBar = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { getSelectedRowIdsSelector } = useRecordTableStates(recordTableId);

  const selectedRowIds = useRecoilValue(getSelectedRowIdsSelector());

  const [selectedRecords, setSelectedRecords] = useRecoilState(
    selectedRecordsComponentState(),
  );

  setSelectedRecords(selectedRowIds.length);

  if (!selectedRecords) {
    return null;
  }

  return <ActionBar />;
};
