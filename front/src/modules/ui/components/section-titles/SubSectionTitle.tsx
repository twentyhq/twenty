import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: ReactNode;
};

const StyledSubSectionTitle = styled.h2`
  color: ${({ theme }) => theme.text80};
  font-size: ${({ theme }) => theme.fontSizeMedium};
  font-weight: ${({ theme }) => theme.fontWeightBold};
  line-height: 1.5;
`;

export function SubSectionTitle({ children }: OwnProps) {
  return <StyledSubSectionTitle>{children}</StyledSubSectionTitle>;
}
