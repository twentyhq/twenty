import { RecordBoardCardMultiDragCounterChip } from '@/object-record/record-board/record-board-card/components/RecordBoardCardMultiDragCounterChip';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useContext } from 'react';

// TODO: use the same concept as PortalHovered components in the app
export const RecordBoardCardMultiDragPreview = () => {
  const { recordId } = useContext(RecordBoardCardContext);

  const isRecordIdPrimaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return <RecordBoardCardMultiDragCounterChip />;
};
