import {
  type AiDataPolicy,
  type AiDataResidencyPolicy,
  MODEL_RESIDENCIES_ALLOWED_BY_POLICY,
} from 'twenty-shared/ai';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

const isAiDataResidencyPolicy = (
  dataResidency: string | null | undefined,
): dataResidency is AiDataResidencyPolicy =>
  Object.keys(MODEL_RESIDENCIES_ALLOWED_BY_POLICY).includes(
    dataResidency ?? '',
  );

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
