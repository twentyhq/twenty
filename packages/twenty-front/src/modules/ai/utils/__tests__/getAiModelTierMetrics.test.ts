import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelTierMetrics } from '@/ai/utils/getAiModelTierMetrics';

const tier: ResolvedAiModelTier = {
  tier: 'smart',
  label: 'Smart',
  model: {
    modelId: 'test',
    label: 'Test',
    intelligenceIndex: 51,
    outputTokensPerSecond: 113,
  },
  isPinned: false,
  speedDeltaPercent: 10,
  costDeltaPercent: -23,
  intelligenceDeltaPercent: 8,
};

describe('getAiModelTierMetrics', () => {
  it('shows cost and intelligence above Balanced', () => {
    expect(getAiModelTierMetrics(tier)).toEqual([
      expect.objectContaining({
        key: 'cost',
        description: '23% lower cost than Balanced.',
      }),
      expect.objectContaining({
        key: 'intelligence',
        tooltipTitle: 'Intelligence score: 51',
        description: '8% higher score than Balanced',
      }),
    ]);
  });

  it('shows speed and cost below Balanced', () => {
    expect(
      getAiModelTierMetrics({ ...tier, tier: 'fast' }).map(({ key }) => key),
    ).toEqual(['speed', 'cost']);
  });

  it('shows no comparison for Balanced', () => {
    expect(getAiModelTierMetrics({ ...tier, tier: 'balanced' })).toEqual([]);
  });

  it('omits missing readings while preserving measured ties', () => {
    expect(
      getAiModelTierMetrics({
        ...tier,
        costDeltaPercent: undefined,
        intelligenceDeltaPercent: 0,
      }),
    ).toEqual([
      expect.objectContaining({
        key: 'intelligence',
        deltaPercent: 0,
        description: 'Same score as Balanced',
      }),
    ]);
  });

  it('uses multipliers for increases of at least 100 percent', () => {
    expect(
      getAiModelTierMetrics({
        ...tier,
        costDeltaPercent: 100,
        intelligenceDeltaPercent: 150,
      }),
    ).toEqual([
      expect.objectContaining({ description: '2× the cost of Balanced.' }),
      expect.objectContaining({ description: '2.5× the score of Balanced' }),
    ]);
  });
});
