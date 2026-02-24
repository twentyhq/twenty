import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import styled from '@emotion/styled';
import { NotificationCounter } from 'twenty-ui/navigation';

const StyledNotificationCounter = styled(NotificationCounter)`
  position: absolute;
  top: -7px;
  left: -7px;
  z-index: 1000;
`;

export const RecordTableRowMultiDragCounterChip = () => {
  const originalDragSelection = useAtomComponentValue(
    originalDragSelectionComponentState,
  );

  const selectedCount = originalDragSelection.length ?? 0;

  const shouldShow = selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return <StyledNotificationCounter count={selectedCount} />;
};
