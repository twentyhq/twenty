import {
  AI_DATA_RESIDENCY_POLICIES,
  isAiModelCompliantWithDataPolicy,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// hide options no served model satisfies, but keep a restriction in force listed so it can be lifted
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
    aiModels.some((model) => model.zeroDataRetention ?? false),
});
