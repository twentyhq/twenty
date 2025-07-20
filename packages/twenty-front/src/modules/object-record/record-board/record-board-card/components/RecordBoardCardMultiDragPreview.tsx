import { useBoardCardDragState } from '@/object-record/record-board/hooks/useBoardCardDragState';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledMultiDragPreview = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${({ theme }) => theme.color.blue};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
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

  return <StyledMultiDragPreview>{selectedCount}</StyledMultiDragPreview>;
};
