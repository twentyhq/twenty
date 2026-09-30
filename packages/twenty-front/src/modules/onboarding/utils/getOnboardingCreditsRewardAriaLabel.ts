import { plural } from '@lingui/core/macro';

type GetOnboardingCreditsRewardAriaLabelArgs = {
  label: string;
  creditsReward: number;
  formattedCreditsReward: string;
};

export const getOnboardingCreditsRewardAriaLabel = ({
  label,
  creditsReward,
  formattedCreditsReward,
}: GetOnboardingCreditsRewardAriaLabelArgs) => {
  if (creditsReward <= 0) {
    return undefined;
  }

  return plural(creditsReward, {
    one: `${label}, earn ${formattedCreditsReward} free credit`,
    other: `${label}, earn ${formattedCreditsReward} free credits`,
  });
};
