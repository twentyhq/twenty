import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { NotificationCounter } from 'twenty-ui/navigation';

const StyledNotificationCounter = styled(NotificationCounter)`
  position: absolute;
  top: -7px;
  left: -7px;
  z-index: 1000;
`;

export const RecordTableRowMultiDragCounterChip = () => {
  const originalDragSelection = useRecoilComponentValue(
    originalDragSelectionComponentState,
  );

  const selectedCount = originalDragSelection.length ?? 0;

  const shouldShow = selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return <StyledNotificationCounter count={selectedCount} />;
};
