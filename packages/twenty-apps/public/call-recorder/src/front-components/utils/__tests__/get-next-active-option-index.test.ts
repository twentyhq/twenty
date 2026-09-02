import { describe, expect, it } from 'vitest';

import { getNextActiveOptionIndex } from 'src/front-components/utils/get-next-active-option-index.util';

describe('getNextActiveOptionIndex', () => {
  it.each([
    { key: 'ArrowDown' as const, currentIndex: 1, expectedIndex: 2 },
    { key: 'ArrowDown' as const, currentIndex: 3, expectedIndex: 0 },
    { key: 'ArrowUp' as const, currentIndex: 2, expectedIndex: 1 },
    { key: 'ArrowUp' as const, currentIndex: 0, expectedIndex: 3 },
    { key: 'Home' as const, currentIndex: 2, expectedIndex: 0 },
    { key: 'End' as const, currentIndex: 1, expectedIndex: 3 },
  ])(
    'returns $expectedIndex for $key from $currentIndex',
    ({ key, currentIndex, expectedIndex }) => {
      expect(
        getNextActiveOptionIndex({
          key,
          currentIndex,
          optionCount: 4,
        }),
      ).toBe(expectedIndex);
    },
  );

  it('returns zero when there are no options', () => {
    expect(
      getNextActiveOptionIndex({
        key: 'ArrowDown',
        currentIndex: 0,
        optionCount: 0,
      }),
    ).toBe(0);
  });
});
