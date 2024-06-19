import styled from '@emotion/styled';

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
`;

const StyledIconWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 1 : 0)};
  transition: opacity 0.1s;
`;

export const GripCell = ({ isDragging }: { isDragging: boolean }) => {
  return (
    <StyledContainer>
      <StyledIconWrapper className="icon" isDragging={isDragging}>
        <IconListViewGrip />
      </StyledIconWrapper>
    </StyledContainer>
  );
};
