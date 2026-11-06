import {
  DATA_RESIDENCY_REGIONS,
  type AiDataPolicy,
  type DataResidencyRegion,
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
    'requiredDataResidency' | 'isZeroDataRetentionRequired'
  >;
}): {
  dataResidencyRegions: DataResidencyRegion[];
  isZeroDataRetentionAvailable: boolean;
} => ({
  dataResidencyRegions: DATA_RESIDENCY_REGIONS.filter(
    (dataResidencyRegion) =>
      dataResidencyRegion === aiDataPolicy.requiredDataResidency ||
      aiModels.some((model) =>
        isAiModelCompliantWithDataPolicy({
          model,
          aiDataPolicy: {
            requiredDataResidency: dataResidencyRegion,
            isZeroDataRetentionRequired: false,
          },
        }),
      ),
  ),
  isZeroDataRetentionAvailable:
    aiDataPolicy.isZeroDataRetentionRequired ||
    aiModels.some((model) => model.zeroDataRetention ?? false),
});
