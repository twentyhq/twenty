import { getMaxLabelLength } from '@/page-layout/widgets/graph/utils/getMaxLabelLength';

describe('getMaxLabelLength', () => {
  it('returns 0 for undefined input', () => {
    expect(getMaxLabelLength(undefined)).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(getMaxLabelLength([])).toBe(0);
  });

  it('returns max length from array of labels', () => {
    expect(getMaxLabelLength(['a', 'bb', 'ccc'])).toBe(3);
  });

  it('returns correct length when max is not last', () => {
    expect(getMaxLabelLength(['longest', 'short', 'med'])).toBe(7);
  });

  it('handles single item array', () => {
    expect(getMaxLabelLength(['single'])).toBe(6);
  });

  it('handles null/undefined items in array', () => {
    expect(
      getMaxLabelLength(['valid', null as unknown as string, 'test']),
    ).toBe(5);
    expect(getMaxLabelLength([undefined as unknown as string, 'abc'])).toBe(3);
  });

  it('handles empty strings in array', () => {
    expect(getMaxLabelLength(['', 'abc', ''])).toBe(3);
  });
});
