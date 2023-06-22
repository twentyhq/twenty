import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: ReactNode;
};

const StyledMainSectionTitle = styled.h2`
  color: ${({ theme }) => theme.text80};
  font-size: ${({ theme }) => theme.fontSizeExtraLarge};
  font-weight: ${({ theme }) => theme.fontWeightBold};
  line-height: 1.5;
`;

export function MainSectionTitle({ children }: OwnProps) {
  return <StyledMainSectionTitle>{children}</StyledMainSectionTitle>;
}
