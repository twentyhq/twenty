import { plural } from '@lingui/core/macro';

type GetOnboardingRewardCreditsAriaLabelArgs = {
  label: string;
  rewardCredits: number;
  isRewardPerItem?: boolean;
};

export const getOnboardingRewardCreditsAriaLabel = ({
  label,
  rewardCredits,
  isRewardPerItem = false,
}: GetOnboardingRewardCreditsAriaLabelArgs) => {
  if (rewardCredits <= 0) {
    return undefined;
  }

  return isRewardPerItem
    ? plural(rewardCredits, {
        one: `${label}, earn # free credit each`,
        other: `${label}, earn # free credits each`,
      })
    : plural(rewardCredits, {
        one: `${label}, earn # free credit`,
        other: `${label}, earn # free credits`,
      });
};
