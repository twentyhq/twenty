import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveBoardCard } from '@/object-record/record-board/hooks/useActiveBoardCard';
import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { useContext } from 'react';

export const RecordBoardDeactivateBoardCardEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { deactivateBoardCard } = useActiveBoardCard(recordBoardId);

  useListenRightDrawerClose(() => {
    deactivateBoardCard();
  });

  return null;
};
