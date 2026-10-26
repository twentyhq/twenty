import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { getNextGettingStartedStep } from '@/getting-started/utils/getNextGettingStartedStep';
import {
  type GettingStartedStep,
  type GettingStartedStepDefinition,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export const getGettingStartedStepSelection = ({
  steps,
  completedSteps,
  savedSelectedStep,
  permissionFlagMap,
}: {
  steps: GettingStartedStepDefinition[];
  completedSteps: GettingStartedStep[];
  savedSelectedStep: GettingStartedStep | null | undefined;
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}): { selectedStep: GettingStartedStep; stepAfterSkip: GettingStartedStep } => {
  const stepKeys = steps.map(({ key }) => key);
  const currentStep =
    getGettingStartedRemainingSteps({
      steps,
      completedSteps,
      permissionFlagMap,
    })[0] ??
    stepKeys.find((step) => !completedSteps.includes(step)) ??
    stepKeys[0];
  const selectedStep = savedSelectedStep ?? currentStep;

  return {
    selectedStep,
    stepAfterSkip: completedSteps.includes(selectedStep)
      ? currentStep
      : getNextGettingStartedStep({
          steps: stepKeys,
          selectedStep,
          completedSteps,
        }),
  };
};
