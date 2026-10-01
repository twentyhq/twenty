import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// A pinned model sits on its own tier, else on the tier closest in intelligence.
export const getNearestAiModelTier = (
  model: ClientAiModelConfig | undefined,
  tiers: ResolvedAiModelTier[],
): AiModelTier => {
  const exactTier = tiers.find(
    (tier) => isDefined(model) && tier.model?.modelId === model.modelId,
  );

  if (isDefined(exactTier)) {
    return exactTier.tier;
  }

  const intelligenceIndex = model?.intelligenceIndex;

  if (!isDefined(intelligenceIndex)) {
    return 'balanced';
  }

  const rankedTiers = tiers
    .filter((tier) => isDefined(tier.model?.intelligenceIndex))
    .sort(
      (first, second) =>
        Math.abs((first.model?.intelligenceIndex ?? 0) - intelligenceIndex) -
        Math.abs((second.model?.intelligenceIndex ?? 0) - intelligenceIndex),
    );

  return rankedTiers[0]?.tier ?? 'balanced';
};
