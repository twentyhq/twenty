import styled from '@emotion/styled';
import { useContext } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { IconListViewGrip } from '@/ui/input/components/IconListViewGrip';

const StyledContainer = styled.div`
  cursor: grab;
  width: 16px;
  height: 32px;
  z-index: 200;
  display: flex;
  &:hover .icon {
    opacity: 1;
  }

  border-color: transparent;
`;

const StyledIconWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 1 : 0)};
  transition: opacity 0.1s;
`;

export const RecordTableCellGrip = () => {
  const { dragHandleProps, isDragging } = useContext(RecordTableRowContext);

  return (
    <RecordTableTd
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      hasRightBorder={false}
      hasBottomBorder={false}
    >
      <StyledContainer>
        <StyledIconWrapper className="icon" isDragging={isDragging}>
          <IconListViewGrip />
        </StyledIconWrapper>
      </StyledContainer>
    </RecordTableTd>
  );
};
