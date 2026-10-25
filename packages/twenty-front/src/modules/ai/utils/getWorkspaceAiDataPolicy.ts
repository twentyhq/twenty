import { isAiDataResidencyPolicy, type AiDataPolicy } from 'twenty-shared/ai';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export const getWorkspaceAiDataPolicy = (
  workspace: Pick<
    CurrentWorkspace,
    'aiDataResidency' | 'isAiZeroDataRetentionRequired'
  > | null,
): AiDataPolicy => ({
  aiDataResidency: isAiDataResidencyPolicy(workspace?.aiDataResidency)
    ? workspace.aiDataResidency
    : null,
  isAiZeroDataRetentionRequired:
    workspace?.isAiZeroDataRetentionRequired ?? false,
});
