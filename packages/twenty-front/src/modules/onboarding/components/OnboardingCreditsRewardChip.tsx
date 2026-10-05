import { useLingui } from '@lingui/react/macro';
import { IconCoins } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/primitives/data-display';

type OnboardingCreditsRewardChipProps = {
  formattedCreditsReward: string;
  isRewardPerItem?: boolean;
};

export const OnboardingCreditsRewardChip = ({
  formattedCreditsReward,
  isRewardPerItem = false,
}: OnboardingCreditsRewardChipProps) => {
  const { t } = useLingui();

  return (
    <Pill
      Icon={IconCoins}
      label={
        isRewardPerItem
          ? t`+${formattedCreditsReward} each`
          : `+${formattedCreditsReward}`
      }
      size="md"
      color="inherit"
    />
  );
};
