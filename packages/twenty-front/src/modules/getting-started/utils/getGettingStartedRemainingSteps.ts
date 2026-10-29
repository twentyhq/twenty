import {
  type GettingStartedStep,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

export const getGettingStartedRemainingSteps = ({
  steps,
  completedSteps,
}: {
  steps: GettingStartedStepDefinition[];
  completedSteps: GettingStartedStep[];
}): GettingStartedStepDefinition[] =>
  steps.filter(({ step }) => !completedSteps.includes(step));
