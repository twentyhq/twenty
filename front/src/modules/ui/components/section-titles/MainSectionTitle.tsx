import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: ReactNode;
};

const StyledMainSectionTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  margin: 0;
`;

export function MainSectionTitle({ children }: OwnProps) {
  return <StyledMainSectionTitle>{children}</StyledMainSectionTitle>;
}
