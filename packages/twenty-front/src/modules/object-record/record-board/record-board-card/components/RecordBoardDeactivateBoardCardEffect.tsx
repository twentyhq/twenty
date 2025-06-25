import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useContext } from 'react';

export const RecordBoardDeactivateBoardCardEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { deactivateBoardCard } = useActiveRecordBoardCard(recordBoardId);

  useListenToSidePanelClosing(() => {
    deactivateBoardCard();
  });

  return null;
};
