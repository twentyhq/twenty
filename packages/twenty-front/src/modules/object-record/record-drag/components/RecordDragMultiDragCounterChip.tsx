import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { NotificationCounter } from 'twenty-ui/data-display';

const StyledNotificationCounterContainer = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  top: -7px;
  z-index: 1000;
  ${({ side }) => `${side}: -7px;`}
`;

export const RecordDragMultiDragCounterChip = ({
  side = 'right',
}: {
  side?: 'left' | 'right';
}) => {
  const originalDragSelection = useAtomComponentStateValue(
    originalDragSelectionComponentState,
  );

  const selectedCount = originalDragSelection.length ?? 0;

  const shouldShow = selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return (
    <StyledNotificationCounterContainer side={side}>
      <NotificationCounter count={selectedCount} />
    </StyledNotificationCounterContainer>
  );
};
