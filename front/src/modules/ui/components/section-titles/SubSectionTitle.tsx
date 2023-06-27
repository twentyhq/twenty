import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: ReactNode;
};

const StyledSubSectionTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: 1.5;
`;

export function SubSectionTitle({ children }: OwnProps) {
  return <StyledSubSectionTitle>{children}</StyledSubSectionTitle>;
}
