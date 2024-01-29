import { useRecoilValue } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

type RecordBoardActionBarProps = {
  recordBoardId: string;
};

export const RecordBoardActionBar = ({
  recordBoardId,
}: RecordBoardActionBarProps) => {
  const { getSelectedRecordIdsSelector } = useRecordBoardStates(recordBoardId);

  const selectedRowIds = useRecoilValue(getSelectedRecordIdsSelector());

  return <ActionBar selectedIds={selectedRowIds} />;
};
