import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  leftComponent?: ReactNode;
  rightComponents?: ReactNode[];
  bottomComponent?: ReactNode;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTableHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 40px;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledLeftSection = styled.div`
  display: flex;
`;

const StyledRightSection = styled.div`
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: 2px;
`;

export function TopBar({
  leftComponent,
  rightComponents,
  bottomComponent,
}: OwnProps) {
  return (
    <StyledContainer>
      <StyledTableHeader>
        <StyledLeftSection>{leftComponent}</StyledLeftSection>
        <StyledRightSection>{rightComponents}</StyledRightSection>
      </StyledTableHeader>
      {bottomComponent}
    </StyledContainer>
  );
}
