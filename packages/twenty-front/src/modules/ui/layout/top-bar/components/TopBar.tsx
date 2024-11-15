import styled from '@emotion/styled';
import { ReactNode } from 'react';

type TopBarProps = {
  className?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  bottomComponent?: ReactNode;
  displayBottomBorder?: boolean;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(2)};

  flex-direction: column;
`;

const StyledTopBar = styled.div`
  align-items: center;

  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 39px;
  justify-content: space-between;
  padding-right: ${({ theme }) => theme.spacing(2)};

  z-index: 7;
`;

const StyledLeftSection = styled.div`
  display: flex;
`;

const StyledRightSection = styled.div`
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;

export const TopBar = ({
  className,
  leftComponent,
  rightComponent,
  bottomComponent,
}: TopBarProps) => (
  <StyledContainer className={className}>
    <StyledTopBar>
      <StyledLeftSection>{leftComponent}</StyledLeftSection>
      <StyledRightSection>{rightComponent}</StyledRightSection>
    </StyledTopBar>
    {bottomComponent}
  </StyledContainer>
);
