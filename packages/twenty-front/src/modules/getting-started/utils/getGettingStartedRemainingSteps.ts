import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import {
  type GettingStartedStep,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export const getGettingStartedRemainingSteps = ({
  steps,
  completedSteps,
  permissionFlagMap,
}: {
  steps: GettingStartedStep[];
  completedSteps: GettingStartedStep[];
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}): GettingStartedStep[] =>
  steps.filter(
    (step) =>
      !completedSteps.includes(step) &&
      permissionFlagMap[GETTING_STARTED_STEP_CONTENT[step].permissionFlag],
  );
