import { useBoardCardDragState } from '@/object-record/record-board/hooks/useBoardCardDragState';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { NotificationCounter } from 'twenty-ui/navigation';

const StyledNotificationCounter = styled(NotificationCounter)`
  position: absolute;
  top: -7px;
  right: -7px;
  z-index: 1000;
`;

type RecordBoardCardMultiDragPreviewProps = {
  isDragging: boolean;
};

export const RecordBoardCardMultiDragPreview = ({
  isDragging,
}: RecordBoardCardMultiDragPreviewProps) => {
  const { recordId } = useContext(RecordBoardCardContext);
  const multiDragState = useBoardCardDragState();

  const isCurrentCardSelected =
    multiDragState?.originalSelection.includes(recordId) || false;
  const selectedCount = multiDragState?.originalSelection.length || 0;

  const shouldShow = isDragging && isCurrentCardSelected && selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return <StyledNotificationCounter count={selectedCount} />;
};
