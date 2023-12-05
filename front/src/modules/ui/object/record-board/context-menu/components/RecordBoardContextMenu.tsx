import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';

export const RecordBoardContextMenu = () => {
  const { selectedCardIdsSelector } = useRecordBoardScopedStates();
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ContextMenu selectedIds={selectedCardIds}></ContextMenu>;
};
