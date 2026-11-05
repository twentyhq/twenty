import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
  isAiModelCompliantWithDataPolicy,
} from 'twenty-shared/ai';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const getAvailableAiDataPolicyOptions = ({
  aiModels,
  aiDataPolicy,
}: {
  aiModels: Pick<ClientAiModelConfig, 'dataResidency' | 'zeroDataRetention'>[];
  aiDataPolicy: Pick<
    AiDataPolicy,
    'dataResidency' | 'isZeroDataRetentionRequired'
  >;
}): {
  dataResidencies: AiDataResidencyPolicy[];
  isZeroDataRetentionAvailable: boolean;
} => ({
  dataResidencies: AI_DATA_RESIDENCY_POLICIES.filter(
    (dataResidency) =>
      dataResidency === aiDataPolicy.dataResidency ||
      aiModels.some((model) =>
        isAiModelCompliantWithDataPolicy({
          model,
          aiDataPolicy: { dataResidency, isZeroDataRetentionRequired: false },
        }),
      ),
  ),
  isZeroDataRetentionAvailable:
    aiDataPolicy.isZeroDataRetentionRequired ||
    aiModels.some((model) => model.zeroDataRetention ?? false),
});
