import { useRecoilValue } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

type RecordBoardContextMenuProps = {
  recordBoardId: string;
};

export const RecordBoardContextMenu = ({
  recordBoardId,
}: RecordBoardContextMenuProps) => {
  const { getSelectedRecordIdsSelector } = useRecordBoardStates(recordBoardId);

  const selectedRecordIds = useRecoilValue(getSelectedRecordIdsSelector());

  if (!selectedRecordIds.length) {
    return null;
  }

  return <ContextMenu />;
};
