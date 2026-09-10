import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getNearestAiModelTier } from '@/ai/utils/getNearestAiModelTier';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

const buildModel = (
  modelId: string,
  intelligenceIndex?: number,
): ClientAiModelConfig => ({
  modelId,
  label: modelId,
  sdkPackage: null,
  intelligenceIndex,
});

const tierModels: Pick<ResolvedAiModelTier, 'tier' | 'model'>[] = [
  { tier: 'extraFast', model: buildModel('a/lite', 20) },
  { tier: 'fast', model: buildModel('a/fast', 37) },
  { tier: 'balanced', model: buildModel('a/balanced', 42) },
  { tier: 'smart', model: buildModel('a/smart', 47) },
  { tier: 'extraSmart', model: undefined },
];

const tiers: ResolvedAiModelTier[] = tierModels.map((tier) => ({
  ...tier,
  label: tier.tier,
  isPinned: false,
  speedDeltaPercent: undefined,
  intelligenceDeltaPercent: undefined,
}));

describe('getNearestAiModelTier', () => {
  it('returns the tier that resolves to the model itself', () => {
    expect(getNearestAiModelTier(buildModel('a/smart', 1), tiers)).toBe(
      'smart',
    );
  });

  it('picks the tier whose model is closest in intelligence', () => {
    expect(getNearestAiModelTier(buildModel('b/other', 39), tiers)).toBe(
      'fast',
    );
    expect(getNearestAiModelTier(buildModel('b/other', 60), tiers)).toBe(
      'smart',
    );
  });

  it('falls back to balanced without a benchmark', () => {
    expect(getNearestAiModelTier(buildModel('b/other'), tiers)).toBe(
      'balanced',
    );
    expect(getNearestAiModelTier(undefined, tiers)).toBe('balanced');
  });
});
