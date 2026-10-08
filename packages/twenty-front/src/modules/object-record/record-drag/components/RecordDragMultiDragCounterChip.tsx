import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { NotificationCounter } from 'twenty-ui/components/data-display';

const StyledNotificationCounterContainer = styled.div`
  position: absolute;
  right: -7px;
  top: -7px;
  z-index: 1000;
`;

export const RecordDragMultiDragCounterChip = () => {
  const draggedRecordIds = useAtomComponentStateValue(
    draggedRecordIdsComponentState,
  );

  if (draggedRecordIds.length <= 1) {
    return null;
  }

  return (
    <StyledNotificationCounterContainer>
      <NotificationCounter count={draggedRecordIds.length} />
    </StyledNotificationCounterContainer>
  );
};
