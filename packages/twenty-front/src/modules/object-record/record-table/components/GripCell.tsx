import styled from '@emotion/styled';

import { IconListViewGrip } from '@/ui/input/components/IconListViewGrip';

const StyledContainer = styled.div`
  cursor: grab;
  width: 8px;
  height: 32px;
  opacity: 0;
  transition: opacity 0.1ys;
  &:hover {
    opacity: 1;
  }
`;

export const GripCell = () => {
  return (
    <StyledContainer>
      <IconListViewGrip />
    </StyledContainer>
  );
};
