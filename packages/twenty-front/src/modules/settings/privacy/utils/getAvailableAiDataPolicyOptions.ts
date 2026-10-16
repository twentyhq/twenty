import {
  AI_DATA_RESIDENCY_POLICIES,
  isAiModelCompliantWithDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// an option no served model satisfies would only lock the workspace out of AI
export const getAvailableAiDataPolicyOptions = (
  aiModels: Pick<ClientAiModelConfig, 'dataResidency' | 'zeroDataRetention'>[],
): {
  aiDataResidencies: AiDataResidencyPolicy[];
  isZeroDataRetentionAvailable: boolean;
} => ({
  aiDataResidencies: AI_DATA_RESIDENCY_POLICIES.filter((aiDataResidency) =>
    aiModels.some((model) =>
      isAiModelCompliantWithDataPolicy(model, {
        aiDataResidency,
        isAiZeroDataRetentionRequired: false,
      }),
    ),
  ),
  isZeroDataRetentionAvailable: aiModels.some(
    (model) => model.zeroDataRetention === true,
  ),
});
