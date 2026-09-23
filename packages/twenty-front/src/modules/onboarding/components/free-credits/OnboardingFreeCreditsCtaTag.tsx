import { styled } from '@linaria/react';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

// Mixed with the button's own text color so the tag stays readable on the
// inverted main button in both light and dark themes.
const StyledTag = styled.span`
  align-items: center;
  background-color: color-mix(
    in srgb,
    ${themeCssVariables.color.green9} 20%,
    transparent
  );
  border-radius: ${themeCssVariables.border.radius.smRound};
  color: color-mix(
    in srgb,
    ${themeCssVariables.color.green9} 60%,
    currentColor
  );
  corner-shape: round;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 20px;
  padding: 0 ${themeCssVariables.spacing['1.5']};
  pointer-events: none;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: 50%;
  transform: translateY(-50%);
`;

type OnboardingFreeCreditsCtaTagProps = {
  label: string;
};

export const OnboardingFreeCreditsCtaTag = ({
  label,
}: OnboardingFreeCreditsCtaTagProps) => {
  const theme = useTheme();

  return (
    <StyledTag aria-hidden>
      <IconCoins size={theme.icon.size.sm} />
      {label}
    </StyledTag>
  );
};
