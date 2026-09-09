import { withModelRanking } from '@/settings/ai/utils/withModelRanking';

it.each([
  [10, [10], false, 'Description'],
  [30, [10, 20, 30], false, '#1/3 · Description'],
  [10, [10, 20, 30], true, '#1/3 · Description'],
  [30, [10, 20, 30, 30], false, '#1/4 · Description'],
  [20, [10, 20, 30, 30], false, '#3/4 · Description'],
])(
  'ranks %s in %j with lowerIsBetter=%s',
  (value, comparisonValues, lowerIsBetter, expected) => {
    expect(
      withModelRanking({
        description: 'Description',
        value,
        comparisonValues,
        lowerIsBetter,
      }),
    ).toBe(expected);
  },
);
