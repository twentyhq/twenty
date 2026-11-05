import { type AiDataPolicy, isAiDataResidencyPolicy } from 'twenty-shared/ai';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export const getWorkspaceAiDataPolicy = (
  workspace: Pick<CurrentWorkspace, 'aiDataPolicy'> | null,
): AiDataPolicy => {
  const dataResidency = workspace?.aiDataPolicy?.dataResidency;

  return {
    dataResidency: isAiDataResidencyPolicy(dataResidency)
      ? dataResidency
      : null,
    isZeroDataRetentionRequired:
      workspace?.aiDataPolicy?.isZeroDataRetentionRequired ?? false,
    isProductImprovementDataSharingEnabled:
      workspace?.aiDataPolicy?.isProductImprovementDataSharingEnabled ?? true,
  };
};
