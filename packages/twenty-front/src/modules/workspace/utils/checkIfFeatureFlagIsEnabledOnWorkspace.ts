import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const checkIfFeatureFlagIsEnabledOnWorkspace = (
  featureKey: FeatureFlagKey | null | undefined,
  workspace: CurrentWorkspace | null | undefined,
) => {
  if (
    !isDefined(featureKey) ||
    !isDefined(workspace) ||
    !isDefined(workspace.featureFlags)
  ) {
    return false;
  }

  const featureFlag = workspace.featureFlags.find(
    (flag) => flag.key === featureKey,
  );

  return featureFlag?.value === true;
};
