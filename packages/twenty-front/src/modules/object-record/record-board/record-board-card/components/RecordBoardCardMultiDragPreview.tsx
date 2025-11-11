import { RecordBoardCardMultiDragCounterChip } from '@/object-record/record-board/record-board-card/components/RecordBoardCardMultiDragCounterChip';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useContext } from 'react';

// TODO: use the same concept as PortalHovered components in the app
export const RecordBoardCardMultiDragPreview = () => {
  const { recordId } = useContext(RecordBoardCardContext);

  const isRecordIdPrimaryDragMultiple = useRecoilComponentFamilyValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  if (!isRecordIdPrimaryDragMultiple) {
    return null;
  }

  return <RecordBoardCardMultiDragCounterChip />;
};
