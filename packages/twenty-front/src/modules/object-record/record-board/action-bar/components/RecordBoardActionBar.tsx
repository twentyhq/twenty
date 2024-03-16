import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { selectedRecordsComponentState } from '@/object-record/record-table/states/selectedRecordsComponentState';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

type RecordBoardActionBarProps = {
  recordBoardId: string;
};

export const RecordBoardActionBar = ({
  recordBoardId,
}: RecordBoardActionBarProps) => {
  const { getSelectedRecordIdsSelector } = useRecordBoardStates(recordBoardId);

  const selectedRecordIds = useRecoilValue(getSelectedRecordIdsSelector());

  const [selectedRecords, setSelectedRecords] = useRecoilState(
    selectedRecordsComponentState(),
  );

  setSelectedRecords(selectedRecordIds.length);

  if (!selectedRecords) {
    return null;
  }

  return <ActionBar />;
};
