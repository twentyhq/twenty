import { plural } from '@lingui/core/macro';

type GetOnboardingRewardCreditsAriaLabelArgs = {
  label: string;
  rewardCredits: number;
};

export const getOnboardingRewardCreditsAriaLabel = ({
  label,
  rewardCredits,
}: GetOnboardingRewardCreditsAriaLabelArgs) => {
  if (rewardCredits <= 0) {
    return undefined;
  }

  return plural(rewardCredits, {
    one: `${label}, earn # free credit`,
    other: `${label}, earn # free credits`,
  });
};
