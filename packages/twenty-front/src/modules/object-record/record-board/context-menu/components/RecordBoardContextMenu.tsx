import { useRecoilValue } from 'recoil';
import { ContextMenu } from 'twenty-ui';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';

type RecordBoardContextMenuProps = {
  recordBoardId: string;
};

export const RecordBoardContextMenu = ({
  recordBoardId,
}: RecordBoardContextMenuProps) => {
  const { selectedRecordIdsSelector } = useRecordBoardStates(recordBoardId);

  const selectedRecordIds = useRecoilValue(selectedRecordIdsSelector());

  if (!selectedRecordIds.length) {
    return null;
  }

  return <ContextMenu />;
};
