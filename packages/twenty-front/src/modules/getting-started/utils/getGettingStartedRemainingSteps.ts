import { type GettingStartedStep } from '~/generated-metadata/graphql';

export const getGettingStartedRemainingSteps = ({
  steps,
  completedSteps,
}: {
  steps: GettingStartedStep[];
  completedSteps: GettingStartedStep[];
}): GettingStartedStep[] =>
  steps.filter((step) => !completedSteps.includes(step));
