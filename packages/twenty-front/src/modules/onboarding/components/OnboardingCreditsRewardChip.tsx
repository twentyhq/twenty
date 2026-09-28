import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { styled } from '@linaria/react';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledCreditsReward = styled.span`
  align-items: center;
  background-color: color-mix(in srgb, currentColor 16%, transparent);
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
  gap: ${themeCssVariables.spacing[0.5]};
  height: 18px;
  padding: 0 ${themeCssVariables.spacing['1.5']};
`;

type OnboardingCreditsRewardChipProps = {
  creditsReward: number;
};

export const OnboardingCreditsRewardChip = ({
  creditsReward,
}: OnboardingCreditsRewardChipProps) => {
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();
  const formattedCreditsReward = formatNumber(creditsReward, { decimals: 2 });

  return (
    <StyledCreditsReward>
      <IconCoins size={theme.icon.size.sm} />
      {`+${formattedCreditsReward}`}
    </StyledCreditsReward>
  );
};
