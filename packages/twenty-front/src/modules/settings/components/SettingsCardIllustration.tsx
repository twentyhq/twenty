import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type ThemeColor, themeCssVariables } from 'twenty-ui/theme';

type SettingsCardIllustrationProps = {
  color: ThemeColor;
  children: ReactNode;
};

const ILLUSTRATION_LINE_INSETS = [
  themeCssVariables.spacing[0],
  themeCssVariables.spacing[1],
  themeCssVariables.spacing[2],
];

const StyledIllustration = styled.span<{ illustrationColor: ThemeColor }>`
  border: 2px solid
    ${({ illustrationColor }) =>
      themeCssVariables.color[`${illustrationColor}6`]};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  height: 40px;
  justify-content: center;
  padding: ${themeCssVariables.spacing['0.5']};
  width: 32px;
`;

const StyledIllustrationBlock = styled.span<{ illustrationColor: ThemeColor }>`
  align-items: center;
  background-color: ${({ illustrationColor }) =>
    themeCssVariables.color[`${illustrationColor}8`]};
  border-radius: calc(
    ${themeCssVariables.border.radius.sm} - ${themeCssVariables.spacing[1]}
  );
  display: flex;
  flex: 1 0 ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing['0.5']};
  justify-content: center;
`;

const StyledIllustrationLine = styled.span<{
  illustrationColor: ThemeColor;
  inset: string;
}>`
  background-color: ${({ illustrationColor }) =>
    themeCssVariables.color[`${illustrationColor}4`]};
  border-radius: ${themeCssVariables.border.radius.xs};
  flex: 0 0 3px;
  margin-right: ${({ inset }) => inset};
`;

export const SettingsCardIllustration = ({
  color,
  children,
}: SettingsCardIllustrationProps) => (
  <StyledIllustration illustrationColor={color} aria-hidden>
    <StyledIllustrationBlock illustrationColor={color}>
      {children}
    </StyledIllustrationBlock>
    {ILLUSTRATION_LINE_INSETS.map((inset) => (
      <StyledIllustrationLine
        key={inset}
        illustrationColor={color}
        inset={inset}
      />
    ))}
  </StyledIllustration>
);
