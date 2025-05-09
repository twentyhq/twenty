import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { useContext } from 'react';

export const RecordBoardDeactivateBoardCardEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { deactivateBoardCard } = useActiveRecordBoardCard(recordBoardId);

  useListenRightDrawerClose(() => {
    deactivateBoardCard();
  });

  return null;
};
