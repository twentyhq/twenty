import { useRecoilValue } from 'recoil';
import { ActionBar } from 'twenty-ui';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';

type RecordBoardActionBarProps = {
  recordBoardId: string;
};

export const RecordBoardActionBar = ({
  recordBoardId,
}: RecordBoardActionBarProps) => {
  const { selectedRecordIdsSelector } = useRecordBoardStates(recordBoardId);

  const selectedRecordIds = useRecoilValue(selectedRecordIdsSelector());

  if (!selectedRecordIds.length) {
    return null;
  }

  return <ActionBar />;
};
