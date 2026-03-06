import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { NotificationCounter } from 'twenty-ui/navigation';

const StyledNotificationCounterContainer = styled.div`
  position: absolute;
  right: -7px;
  top: -7px;
  z-index: 1000;
`;

export const RecordBoardCardMultiDragCounterChip = () => {
  const originalDragSelection = useAtomComponentStateValue(
    originalDragSelectionComponentState,
  );

  const selectedCount = originalDragSelection.length ?? 0;

  const shouldShow = selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return (
    <StyledNotificationCounterContainer>
      <NotificationCounter count={selectedCount} />
    </StyledNotificationCounterContainer>
  );
};
