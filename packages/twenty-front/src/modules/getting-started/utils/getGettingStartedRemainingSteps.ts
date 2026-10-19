import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from '@/getting-started/constants/GettingStartedStepPermissionFlags';
import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import {
  type GettingStartedStep,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export const getGettingStartedRemainingSteps = ({
  completedSteps,
  permissionFlagMap,
}: {
  completedSteps: GettingStartedStep[];
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}): GettingStartedStep[] =>
  GETTING_STARTED_STEPS.filter(
    (step) =>
      !completedSteps.includes(step) &&
      permissionFlagMap[GETTING_STARTED_STEP_PERMISSION_FLAGS[step]],
  );
