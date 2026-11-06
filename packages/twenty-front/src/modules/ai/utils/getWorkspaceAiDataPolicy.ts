import { type AiDataPolicy, isDataResidencyRegion } from 'twenty-shared/ai';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export const getWorkspaceAiDataPolicy = (
  workspace: Pick<CurrentWorkspace, 'aiDataPolicy'> | null,
): AiDataPolicy => {
  const requiredDataResidency = workspace?.aiDataPolicy?.requiredDataResidency;

  return {
    requiredDataResidency: isDataResidencyRegion(requiredDataResidency)
      ? requiredDataResidency
      : null,
    isZeroDataRetentionRequired:
      workspace?.aiDataPolicy?.isZeroDataRetentionRequired ?? false,
    isProductImprovementDataSharingEnabled:
      workspace?.aiDataPolicy?.isProductImprovementDataSharingEnabled ?? true,
  };
};
