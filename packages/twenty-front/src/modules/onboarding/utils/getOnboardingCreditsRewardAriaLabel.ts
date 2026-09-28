import { plural } from '@lingui/core/macro';

type GetOnboardingCreditsRewardAriaLabelArgs = {
  label: string;
  creditsReward: number;
};

export const getOnboardingCreditsRewardAriaLabel = ({
  label,
  creditsReward,
}: GetOnboardingCreditsRewardAriaLabelArgs) => {
  if (creditsReward <= 0) {
    return undefined;
  }

  return plural(creditsReward, {
    one: `${label}, earn # free credit`,
    other: `${label}, earn # free credits`,
  });
};
