import { ReactElement } from 'react';
import styled from '@emotion/styled';
import { Chip, ChipVariant, IconPencil } from 'twenty-ui';

import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  width: 100%;
`;

const StyledChildrenContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledChipContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledChildContainer = styled.div<{
  shrink: number;
  isHovered?: boolean;
}>`
  display: flex;
  flex-shrink: ${({ shrink }) => shrink};
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
    <StyledContainer>
      <StyledChildrenContainer>
        {children.map((child, index) => {
          return (
            <StyledChildContainer isHovered={isHovered} shrink={index}>
              {child}
            </StyledChildContainer>
          );
        })}
      </StyledChildrenContainer>
      {isHovered && (
        <StyledChipContainer>
          <Chip label={`+3`} variant={ChipVariant.Highlighted} />
          <FloatingIconButton Icon={IconPencil} />
        </StyledChipContainer>
      )}
    </StyledContainer>
  );
};
