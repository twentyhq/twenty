import { JSX, ReactNode } from 'react';
import styled from '@emotion/styled';

type SubTitleProps = {
  children: ReactNode;
};

const StyledSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SubTitle = ({ children }: SubTitleProps): JSX.Element => (
  <StyledSubTitle>{children}</StyledSubTitle>
);
