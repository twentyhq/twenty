import { getModelComparisonScore } from '@/settings/ai/utils/getModelComparisonScore';

it.each([
  [30, [30], false, 50],
  [30, [10, 20], false, 50],
  [10, [10, 20, 30], false, 8],
  [30, [10, 20, 30], false, 100],
  [10, [10, 20, 30], true, 100],
  [30, [10, 20, 30], true, 8],
])(
  'scores %s in %j with lowerIsBetter=%s as %s',
  (value, comparisonValues, lowerIsBetter, expected) => {
    expect(
      getModelComparisonScore({ value, comparisonValues, lowerIsBetter }),
    ).toBe(expected);
  },
);
