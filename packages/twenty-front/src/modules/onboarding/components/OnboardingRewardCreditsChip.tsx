import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledRewardCredits = styled.span`
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

type OnboardingRewardCreditsChipProps = {
  rewardCredits: number;
  isRewardPerItem?: boolean;
};

export const OnboardingRewardCreditsChip = ({
  rewardCredits,
  isRewardPerItem = false,
}: OnboardingRewardCreditsChipProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();
  const formattedRewardCredits = formatNumber(rewardCredits, { decimals: 2 });

  return (
    <StyledRewardCredits>
      <IconCoins size={theme.icon.size.sm} />
      {isRewardPerItem
        ? t`+${formattedRewardCredits} each`
        : `+${formattedRewardCredits}`}
    </StyledRewardCredits>
  );
};
