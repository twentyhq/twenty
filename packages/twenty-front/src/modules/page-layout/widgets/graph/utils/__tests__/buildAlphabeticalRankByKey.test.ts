import { buildAlphabeticalRankByKey } from '@/page-layout/widgets/graph/utils/buildAlphabeticalRankByKey';

describe('buildAlphabeticalRankByKey', () => {
  it('should assign ranks by alphabetical order of keys', () => {
    const result = buildAlphabeticalRankByKey(['charlie', 'alpha', 'bravo']);

    expect(result.get('alpha')).toBe(0);
    expect(result.get('bravo')).toBe(1);
    expect(result.get('charlie')).toBe(2);
  });

  it('should return the same ranks regardless of input order', () => {
    const firstOrder = buildAlphabeticalRankByKey(['open', 'won', 'lost']);
    const secondOrder = buildAlphabeticalRankByKey(['lost', 'open', 'won']);

    expect(firstOrder).toEqual(secondOrder);
  });

  it('should deduplicate keys so ranks stay dense', () => {
    const result = buildAlphabeticalRankByKey(['bravo', 'alpha', 'bravo']);

    expect(result.size).toBe(2);
    expect(result.get('alpha')).toBe(0);
    expect(result.get('bravo')).toBe(1);
  });

  it('should handle an empty key list', () => {
    expect(buildAlphabeticalRankByKey([]).size).toBe(0);
  });

  it('should not mutate the input array', () => {
    const keys = ['bravo', 'alpha'];

    buildAlphabeticalRankByKey(keys);

    expect(keys).toEqual(['bravo', 'alpha']);
  });
});
