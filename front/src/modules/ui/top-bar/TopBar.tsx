import type { ComponentProps, ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = ComponentProps<'div'> & {
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  bottomComponent?: ReactNode;
  displayBottomBorder?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTopBar = styled.div<{ displayBottomBorder: boolean }>`
  align-items: center;
  border-bottom: ${({ displayBottomBorder, theme }) =>
    displayBottomBorder ? `1px solid ${theme.border.color.light}` : 'none'};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 39px;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  z-index: 5;
`;

const StyledLeftSection = styled.div`
  display: flex;
`;

const StyledRightSection = styled.div`
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;

export function TopBar({
  leftComponent,
  rightComponent,
  bottomComponent,
  displayBottomBorder = true,
  ...props
}: OwnProps) {
  return (
    <StyledContainer {...props}>
      <StyledTopBar displayBottomBorder={displayBottomBorder}>
        <StyledLeftSection>{leftComponent}</StyledLeftSection>
        <StyledRightSection>{rightComponent}</StyledRightSection>
      </StyledTopBar>
      {bottomComponent}
    </StyledContainer>
  );
}
