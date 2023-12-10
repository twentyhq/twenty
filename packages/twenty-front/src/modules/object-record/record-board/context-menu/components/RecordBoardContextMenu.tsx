import { useRecoilValue } from 'recoil';

import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

export const RecordBoardContextMenu = () => {
  const { selectedCardIdsSelector } = useRecordBoardScopedStates();
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ContextMenu selectedIds={selectedCardIds}></ContextMenu>;
};
