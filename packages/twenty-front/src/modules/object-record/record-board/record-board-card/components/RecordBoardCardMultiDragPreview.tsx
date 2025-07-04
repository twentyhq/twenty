import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

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
  opacity: 0;
  transition: opacity 0.2s ease;

  &.show {
    opacity: 1;
  }
`;

interface RecordBoardCardMultiDragPreviewProps {
  isDragging: boolean;
}

export const RecordBoardCardMultiDragPreview = ({
  isDragging,
}: RecordBoardCardMultiDragPreviewProps) => {
  const { recordId } = useContext(RecordBoardCardContext);
  const { recordBoardId } = useContext(RecordBoardContext);

  const selectedRecordIds = useRecoilValue(
    recordBoardSelectedRecordIdsComponentSelector.selectorFamily({
      instanceId: recordBoardId,
    }),
  );

  const isCurrentCardSelected = selectedRecordIds.includes(recordId);
  const selectedCount = selectedRecordIds.length;

  // Only show the preview if:
  // 1. Currently dragging
  // 2. This card is selected
  // 3. There are multiple cards selected
  const shouldShow = isDragging && isCurrentCardSelected && selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return (
    <StyledMultiDragPreview className="show">
      {selectedCount}
    </StyledMultiDragPreview>
  );
};
