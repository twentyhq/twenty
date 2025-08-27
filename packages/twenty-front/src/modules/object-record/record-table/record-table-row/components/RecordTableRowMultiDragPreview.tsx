import { styled } from '@linaria/react';
import { NotificationCounter } from 'twenty-ui/navigation';

import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';

const StyledNotificationCounter = styled(NotificationCounter)`
  position: absolute;
  top: -7px;
  left: -7px;
  z-index: 1000;
`;

type RecordTableRowMultiDragPreviewProps = {
  isDragging: boolean;
};

export const RecordTableRowMultiDragPreview = ({
  isDragging,
}: RecordTableRowMultiDragPreviewProps) => {
  const { recordId } = useRecordTableRowContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();
  const multiDragState = useRecordDragState('table', recordTableId);

  const isCurrentRowSelected =
    multiDragState?.originalSelection.includes(recordId) || false;
  const selectedCount = multiDragState?.originalSelection.length ?? 0;

  const shouldShow = isDragging && isCurrentRowSelected && selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return <StyledNotificationCounter count={selectedCount} />;
};
