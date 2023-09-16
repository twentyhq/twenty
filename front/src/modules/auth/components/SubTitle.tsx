import { JSX, ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: ReactNode;
};

const StyledSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SubTitle = ({ children }: OwnProps): JSX.Element => (
  <StyledSubTitle>{children}</StyledSubTitle>
);
