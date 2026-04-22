import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ThemeSpacingKey = keyof typeof themeCssVariables.spacing;

type SettingsEmptyPlaceholderProps = {
  children: ReactNode;
  padding?: ThemeSpacingKey;
  textAlign?: 'left' | 'center' | 'right';
};

const StyledPlaceholder = styled.div<{
  placeholderPadding: string;
  placeholderTextAlign: string;
}>`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${({ placeholderPadding }) => placeholderPadding};
  text-align: ${({ placeholderTextAlign }) => placeholderTextAlign};
`;

export const SettingsEmptyPlaceholder = ({
  children,
  padding = '8',
  textAlign = 'center',
}: SettingsEmptyPlaceholderProps) => {
  return (
    <StyledPlaceholder
      placeholderPadding={themeCssVariables.spacing[padding]}
      placeholderTextAlign={textAlign}
    >
      {children}
    </StyledPlaceholder>
  );
};
