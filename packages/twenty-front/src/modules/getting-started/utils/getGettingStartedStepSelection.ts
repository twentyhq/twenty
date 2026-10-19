import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { getNextGettingStartedStep } from '@/getting-started/utils/getNextGettingStartedStep';
import {
  type GettingStartedStep,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export const getGettingStartedStepSelection = ({
  completedSteps,
  savedSelectedStep,
  permissionFlagMap,
}: {
  completedSteps: GettingStartedStep[];
  savedSelectedStep: GettingStartedStep | null | undefined;
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}): { selectedStep: GettingStartedStep; stepAfterSkip: GettingStartedStep } => {
  const currentStep =
    getGettingStartedRemainingSteps({ completedSteps, permissionFlagMap })[0] ??
    GETTING_STARTED_STEPS.find((step) => !completedSteps.includes(step)) ??
    GETTING_STARTED_STEPS[0];
  const selectedStep = savedSelectedStep ?? currentStep;

  return {
    selectedStep,
    stepAfterSkip: completedSteps.includes(selectedStep)
      ? currentStep
      : getNextGettingStartedStep({ selectedStep, completedSteps }),
  };
};
