import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { IconCoins } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/primitives/data-display';

type OnboardingCreditsRewardChipProps = {
  creditsReward: number;
};

export const OnboardingCreditsRewardChip = ({
  creditsReward,
}: OnboardingCreditsRewardChipProps) => {
  const { formatNumber } = useNumberFormat();
  const formattedCreditsReward = formatNumber(creditsReward, { decimals: 2 });

  return (
    <Pill
      Icon={IconCoins}
      label={`+${formattedCreditsReward}`}
      size="md"
      color="inherit"
    />
  );
};
