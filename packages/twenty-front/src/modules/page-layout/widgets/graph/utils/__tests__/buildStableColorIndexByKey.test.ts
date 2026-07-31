import { buildStableColorIndexByKey } from '@/page-layout/widgets/graph/utils/buildStableColorIndexByKey';

describe('buildStableColorIndexByKey', () => {
  it('should assign indexes by alphabetical rank of keys', () => {
    const result = buildStableColorIndexByKey(['charlie', 'alpha', 'bravo']);

    expect(result.get('alpha')).toBe(0);
    expect(result.get('bravo')).toBe(1);
    expect(result.get('charlie')).toBe(2);
  });

  it('should return the same indexes regardless of input order', () => {
    const firstOrder = buildStableColorIndexByKey(['open', 'won', 'lost']);
    const secondOrder = buildStableColorIndexByKey(['lost', 'open', 'won']);

    expect(firstOrder).toEqual(secondOrder);
  });

  it('should handle an empty key list', () => {
    expect(buildStableColorIndexByKey([]).size).toBe(0);
  });

  it('should not mutate the input array', () => {
    const keys = ['bravo', 'alpha'];

    buildStableColorIndexByKey(keys);

    expect(keys).toEqual(['bravo', 'alpha']);
  });
});
