import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { Badge } from 'twenty-ui/primitives/data-display';

const StyledBadgeContainer = styled.div`
  display: flex;
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
    <StyledBadgeContainer>
      <Badge size="xs" color="primary" shape="circle">
        {draggedRecordIds.length}
      </Badge>
    </StyledBadgeContainer>
  );
};
