import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { isDefined } from 'twenty-shared/utils';

import { type GettingStartedStepReward } from '~/generated-metadata/graphql';

type GettingStartedStepRewardChipProps = {
  stepReward: GettingStartedStepReward | undefined;
};

export const GettingStartedStepRewardChip = ({
  stepReward,
}: GettingStartedStepRewardChipProps) => {
  const { numberFormat } = useNumberFormat();

  if (!isDefined(stepReward)) {
    return null;
  }

  return (
    <OnboardingCreditsRewardChip
      formattedCreditsReward={formatOnboardingCredits(
        stepReward.creditsEach,
        numberFormat,
      )}
      isRewardPerItem={stepReward.remainingCount > 1}
    />
  );
};
