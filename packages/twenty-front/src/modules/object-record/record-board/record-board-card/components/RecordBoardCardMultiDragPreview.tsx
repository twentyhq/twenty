import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
  const recordBoardId = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
  );
  const multiDragState = useRecordDragState('board', recordBoardId);

  const isCurrentCardSelected =
    multiDragState?.originalSelection.includes(recordId) || false;
  const selectedCount = multiDragState?.originalSelection.length || 0;

  const shouldShow = isDragging && isCurrentCardSelected && selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return <StyledNotificationCounter count={selectedCount} />;
};
