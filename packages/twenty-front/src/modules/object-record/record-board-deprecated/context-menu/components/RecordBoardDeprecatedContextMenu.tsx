import { useRecoilValue } from 'recoil';

import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

export const RecordBoardDeprecatedContextMenu = () => {
  const { selectedCardIdsSelector } = useRecordBoardDeprecatedScopedStates();
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ContextMenu selectedIds={selectedCardIds}></ContextMenu>;
};
