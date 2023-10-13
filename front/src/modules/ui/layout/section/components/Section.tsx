import { ReactNode } from 'react';
import styled from '@emotion/styled';

type SectionProps = {
  children: ReactNode;
  alignment?: SectionAlignment;
  fullWidth?: boolean;
  fontColor?: SectionFontColor;
};

export enum SectionAlignment {
  Left = 'left',
  Center = 'center',
}

export enum SectionFontColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

const StyledSection = styled.div<{
  alignment: SectionAlignment;
  fullWidth: boolean;
  fontColor: SectionFontColor;
}>`
  color: ${({ theme, fontColor }) => theme.font.color[fontColor]};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: ${({ alignment }) => alignment};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const Section = ({
  children,
  alignment = SectionAlignment.Left,
  fullWidth = true,
  fontColor = SectionFontColor.Primary,
}: SectionProps) => (
  <StyledSection
    alignment={alignment}
    fullWidth={fullWidth}
    fontColor={fontColor}
  >
    {children}
  </StyledSection>
);
