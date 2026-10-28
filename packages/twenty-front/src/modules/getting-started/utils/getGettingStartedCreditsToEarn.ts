import { type GettingStartedStepReward } from '~/generated-metadata/graphql';

export const getGettingStartedCreditsToEarn = ({
  stepRewards,
}: {
  stepRewards: Pick<
    GettingStartedStepReward,
    'creditsEach' | 'remainingCount'
  >[];
}): number =>
  stepRewards.reduce(
    (total, { creditsEach, remainingCount }) =>
      total + creditsEach * remainingCount,
    0,
  );
