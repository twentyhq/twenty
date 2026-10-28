import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import {
  type GettingStartedStep,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export const getGettingStartedStepSelection = ({
  steps,
  completedSteps,
  selectedStep,
  permissionFlagMap,
}: {
  steps: GettingStartedStep[];
  completedSteps: GettingStartedStep[];
  selectedStep: GettingStartedStep | null | undefined;
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}): {
  selectedStep: GettingStartedStep;
  nextStep: GettingStartedStep;
  stepAfterSkip: GettingStartedStep;
} => {
  const currentStep =
    getGettingStartedRemainingSteps({
      steps,
      completedSteps,
      permissionFlagMap,
    })[0] ??
    steps.find((step) => !completedSteps.includes(step)) ??
    steps[0];
  const displayedStep = selectedStep ?? currentStep;
  const displayedStepIndex = steps.indexOf(displayedStep);
  const nextStep =
    [
      ...steps.slice(displayedStepIndex + 1),
      ...steps.slice(0, displayedStepIndex),
    ].find((step) => !completedSteps.includes(step)) ?? displayedStep;

  return {
    selectedStep: displayedStep,
    nextStep,
    stepAfterSkip: completedSteps.includes(displayedStep)
      ? currentStep
      : nextStep,
  };
};
