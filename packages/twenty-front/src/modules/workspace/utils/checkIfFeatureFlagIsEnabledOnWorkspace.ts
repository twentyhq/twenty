import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

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
