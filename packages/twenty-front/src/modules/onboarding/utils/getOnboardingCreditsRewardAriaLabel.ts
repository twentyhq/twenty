import { plural } from '@lingui/core/macro';

type GetOnboardingCreditsRewardAriaLabelArgs = {
  label: string;
  creditsReward: number;
  formattedCreditsReward: string;
  isRewardPerItem?: boolean;
};

export const getOnboardingCreditsRewardAriaLabel = ({
  label,
  creditsReward,
  formattedCreditsReward,
  isRewardPerItem = false,
}: GetOnboardingCreditsRewardAriaLabelArgs) => {
  if (creditsReward <= 0) {
    return undefined;
  }

  return isRewardPerItem
    ? plural(creditsReward, {
        one: `${label}, earn ${formattedCreditsReward} free credit each`,
        other: `${label}, earn ${formattedCreditsReward} free credits each`,
      })
    : plural(creditsReward, {
        one: `${label}, earn ${formattedCreditsReward} free credit`,
        other: `${label}, earn ${formattedCreditsReward} free credits`,
      });
};
