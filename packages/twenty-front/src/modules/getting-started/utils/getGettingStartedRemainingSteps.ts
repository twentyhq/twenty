import {
  type GettingStartedStep,
  type GettingStartedStepDefinition,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

export const getGettingStartedRemainingSteps = ({
  steps,
  completedSteps,
  permissionFlagMap,
}: {
  steps: GettingStartedStepDefinition[];
  completedSteps: GettingStartedStep[];
  permissionFlagMap: Record<PermissionFlagType, boolean>;
}): GettingStartedStep[] =>
  steps
    .filter(
      ({ key, permissionFlag }) =>
        !completedSteps.includes(key) && permissionFlagMap[permissionFlag],
    )
    .map(({ key }) => key);
