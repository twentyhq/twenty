import styled from '@emotion/styled';
import { NotificationCounter } from 'twenty-ui/navigation';

import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useTableRowDragState } from '@/object-record/record-table/hooks/useTableRowDragState';

const StyledNotificationCounter = styled(NotificationCounter)`
  position: absolute;
  top: -7px;
  right: -7px;
  z-index: 1000;
`;

type RecordTableRowMultiDragPreviewProps = {
  isDragging: boolean;
};

export const RecordTableRowMultiDragPreview = ({
  isDragging,
}: RecordTableRowMultiDragPreviewProps) => {
  const { recordId } = useRecordTableRowContextOrThrow();
  const multiDragState = useTableRowDragState();

  const isCurrentRowSelected =
    multiDragState?.originalSelection.includes(recordId) || false;
  const selectedCount = multiDragState?.originalSelection.length || 0;

  const shouldShow = isDragging && isCurrentRowSelected && selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return <StyledNotificationCounter count={selectedCount} />;
};
