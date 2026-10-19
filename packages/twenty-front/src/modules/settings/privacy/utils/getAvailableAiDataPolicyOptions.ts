import {
  AI_DATA_RESIDENCY_POLICIES,
  isAiModelCompliantWithDataPolicy,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// an option no served model satisfies would only lock the workspace out of AI,
// but a restriction already in force stays listed so it can be lifted
export const getAvailableAiDataPolicyOptions = ({
  aiModels,
  aiDataPolicy,
}: {
  aiModels: Pick<ClientAiModelConfig, 'dataResidency' | 'zeroDataRetention'>[];
  aiDataPolicy: AiDataPolicy;
}): {
  aiDataResidencies: AiDataResidencyPolicy[];
  isZeroDataRetentionAvailable: boolean;
} => ({
  aiDataResidencies: AI_DATA_RESIDENCY_POLICIES.filter(
    (aiDataResidency) =>
      aiDataResidency === aiDataPolicy.aiDataResidency ||
      aiModels.some((model) =>
        isAiModelCompliantWithDataPolicy({
          model,
          aiDataPolicy: {
            aiDataResidency,
            isAiZeroDataRetentionRequired: false,
          },
        }),
      ),
  ),
  isZeroDataRetentionAvailable:
    aiDataPolicy.isAiZeroDataRetentionRequired ||
    aiModels.some((model) => model.zeroDataRetention === true),
});
