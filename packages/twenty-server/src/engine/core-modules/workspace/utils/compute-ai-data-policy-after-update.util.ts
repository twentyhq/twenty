import { isUndefined } from '@sniptt/guards';
import { type AiDataPolicy } from 'twenty-shared/ai';

export const computeAiDataPolicyAfterUpdate = ({
  aiDataPolicy,
  update,
}: {
  aiDataPolicy: AiDataPolicy;
  update: Partial<AiDataPolicy>;
}): AiDataPolicy => ({
  aiDataResidency: isUndefined(update.aiDataResidency)
    ? aiDataPolicy.aiDataResidency
    : update.aiDataResidency,
  isAiZeroDataRetentionRequired: isUndefined(
    update.isAiZeroDataRetentionRequired,
  )
    ? aiDataPolicy.isAiZeroDataRetentionRequired
    : update.isAiZeroDataRetentionRequired,
});
