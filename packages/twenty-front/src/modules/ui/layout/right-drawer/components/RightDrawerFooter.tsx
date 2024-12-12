import styled from '@emotion/styled';
import { Fragment } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

type RightDrawerFooterProps = {
  actions: React.ReactNode[];
};

export const RightDrawerFooter = ({ actions }: RightDrawerFooterProps) => {
  return (
    <StyledContainer>
      {actions.map((action, index) => (
        <Fragment key={index}>{action}</Fragment>
      ))}
    </StyledContainer>
  );
};
