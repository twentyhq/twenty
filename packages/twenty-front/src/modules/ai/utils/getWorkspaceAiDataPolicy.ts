import { type AiDataPolicy, isDataResidencyRegion } from 'twenty-shared/ai';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export const getWorkspaceAiDataPolicy = (
  workspace: Pick<CurrentWorkspace, 'aiDataPolicy'> | null,
): AiDataPolicy => {
  const requiredDataResidencyRegion =
    workspace?.aiDataPolicy?.requiredDataResidencyRegion;

  return {
    requiredDataResidencyRegion: isDataResidencyRegion(
      requiredDataResidencyRegion,
    )
      ? requiredDataResidencyRegion
      : null,
    isZeroDataRetentionRequired:
      workspace?.aiDataPolicy?.isZeroDataRetentionRequired ?? false,
    isProductImprovementDataSharingEnabled:
      workspace?.aiDataPolicy?.isProductImprovementDataSharingEnabled ?? true,
  };
};
