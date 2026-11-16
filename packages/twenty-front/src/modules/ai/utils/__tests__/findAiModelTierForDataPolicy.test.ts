import { findAiModelTierForDataPolicy } from '@/ai/utils/findAiModelTierForDataPolicy';
import { AiModelTier } from '~/generated-metadata/graphql';

const OPEN_FAST_TIER = {
  tier: AiModelTier.fast,
  modelId: 'open',
  requiredDataResidencyRegion: null,
  isZeroDataRetentionRequired: false,
};
const EU_FAST_TIER = {
  tier: AiModelTier.fast,
  modelId: 'eu',
  requiredDataResidencyRegion: 'eu',
  isZeroDataRetentionRequired: false,
};
const AI_MODEL_TIERS = [OPEN_FAST_TIER, EU_FAST_TIER];

describe('findAiModelTierForDataPolicy', () => {
  it('returns the entry matching the tier and the policy', () => {
    expect(
      findAiModelTierForDataPolicy({
        aiModelTiers: AI_MODEL_TIERS,
        tier: AiModelTier.fast,
        aiDataPolicy: {
          requiredDataResidencyRegion: 'eu',
          isZeroDataRetentionRequired: false,
        },
      }),
    ).toEqual(EU_FAST_TIER);
  });

  it('returns nothing when no entry serves that policy', () => {
    expect(
      findAiModelTierForDataPolicy({
        aiModelTiers: AI_MODEL_TIERS,
        tier: AiModelTier.fast,
        aiDataPolicy: {
          requiredDataResidencyRegion: null,
          isZeroDataRetentionRequired: true,
        },
      }),
    ).toBeUndefined();
  });
});
