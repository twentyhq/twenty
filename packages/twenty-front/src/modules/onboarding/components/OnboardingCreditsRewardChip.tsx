import { IconCoins } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/primitives/data-display';

type OnboardingCreditsRewardChipProps = {
  formattedCreditsReward: string;
};

export const OnboardingCreditsRewardChip = ({
  formattedCreditsReward,
}: OnboardingCreditsRewardChipProps) => (
  <Pill
    Icon={IconCoins}
    label={`+${formattedCreditsReward}`}
    size="md"
    color="inherit"
  />
);
