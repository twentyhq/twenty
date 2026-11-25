import { type AiDataPolicy } from 'twenty-shared/ai';

import { type AiDataPolicyInput } from 'src/engine/core-modules/workspace/dtos/ai-data-policy.input';
import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

export const buildAiDataPolicy = ({
  aiDataPolicyInput,
  storedAiDataPolicy,
}: {
  aiDataPolicyInput: AiDataPolicyInput;
  storedAiDataPolicy: AiDataPolicy;
}): AiDataPolicy => ({
  ...NO_AI_DATA_POLICY,
  ...storedAiDataPolicy,
  ...aiDataPolicyInput,
  isProductImprovementDataSharingEnabled:
    aiDataPolicyInput.isProductImprovementDataSharingEnabled ??
    storedAiDataPolicy.isProductImprovementDataSharingEnabled ??
    NO_AI_DATA_POLICY.isProductImprovementDataSharingEnabled,
});
