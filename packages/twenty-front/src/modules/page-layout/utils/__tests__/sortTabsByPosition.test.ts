import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';

describe('sortTabsByPosition', () => {
  it('should sort tabs by position ascending', () => {
    const tabs = [
      { id: 'c', position: 3 },
      { id: 'a', position: 1 },
      { id: 'b', position: 2 },
    ];

    const result = sortTabsByPosition(tabs);

    expect(result.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('should return empty array for empty input', () => {
    expect(sortTabsByPosition([])).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const tabs = [
      { id: 'b', position: 2 },
      { id: 'a', position: 1 },
    ];

    sortTabsByPosition(tabs);

    expect(tabs[0].id).toBe('b');
  });

  it('should handle single element', () => {
    const tabs = [{ id: 'a', position: 0 }];

    expect(sortTabsByPosition(tabs)).toEqual([{ id: 'a', position: 0 }]);
  });
});
