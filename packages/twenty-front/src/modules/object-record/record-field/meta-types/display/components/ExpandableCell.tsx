import { ReactElement } from 'react';
import styled from '@emotion/styled';
import { IconPencil } from 'twenty-ui';

import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
const StyledContainer = styled.div<{ isHovered?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: ${({ isHovered }) => (isHovered ? 'hidden' : 'none')};
`;
export const ExpandableCell = ({
  children,
  isHovered,
}: {
  children: ReactElement[];
  isHovered?: boolean;
}) => {
  return (
    <StyledContainer isHovered={isHovered}>
      {children}
      {isHovered && <FloatingIconButton Icon={IconPencil} />}
    </StyledContainer>
  );
};
