import styled from '@emotion/styled';

import { IconListViewGrip } from '@/ui/input/components/IconListViewGrip';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  cursor: grab;
  width: 16px;
  height: 32px;
  z-index: 200;
  display: flex;
  &:hover .icon {
    opacity: 1;
  }
`;

const StyledIconWrapper = styled.div`
  opacity: 0;
  transition: opacity 0.1s;
`;

export const GripCell = () => {
  return (
    <StyledContainer>
      <StyledIconWrapper className="icon">
        <IconListViewGrip />
      </StyledIconWrapper>
    </StyledContainer>
  );
};
