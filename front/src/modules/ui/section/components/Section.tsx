import { ReactNode } from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: ReactNode;
  alignment?: SectionAlignment;
  fullWidth?: boolean;
};

export enum SectionAlignment {
  Left = 'left',
  Center = 'center',
}

const StyledSection = styled.div<{
  alignment: SectionAlignment;
  fullWidth: boolean;
}>`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: ${({ alignment }) => alignment};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export function Section({
  children,
  alignment = SectionAlignment.Left,
  fullWidth = true,
}: OwnProps) {
  return (
    <StyledSection alignment={alignment} fullWidth={fullWidth}>
      {children}
    </StyledSection>
  );
}
