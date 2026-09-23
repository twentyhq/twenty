import { ONBOARDING_CREDIT_REWARDS_POLL_INTERVAL_MS } from '@/onboarding/constants/OnboardingCreditRewardsPollIntervalMs';
import { useQuery } from '@apollo/client/react';
import { GetOnboardingCreditRewardsDocument } from '~/generated-metadata/graphql';

export const useOnboardingCreditRewards = () => {
  // Rewards can land after the step that earns them: apps install in a
  // background job and invited teammates join later.
  const { data } = useQuery(GetOnboardingCreditRewardsDocument, {
    fetchPolicy: 'cache-and-network',
    pollInterval: ONBOARDING_CREDIT_REWARDS_POLL_INTERVAL_MS,
  });

  return data?.getOnboardingCreditRewards;
};
