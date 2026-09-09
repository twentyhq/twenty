import { getModelComparisonPercentile } from '@/settings/ai/utils/getModelComparisonPercentile';

it('uses a neutral percentile for values outside the comparison set', () => {
  expect(getModelComparisonPercentile(5, [10, 20])).toBe(0.5);
  expect(getModelComparisonPercentile(30, [10, 20])).toBe(0.5);
  expect(getModelComparisonPercentile(15, [10, 20])).toBe(0.5);
});
