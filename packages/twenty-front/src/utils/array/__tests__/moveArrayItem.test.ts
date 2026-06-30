import { moveArrayItem } from '~/utils/array/moveArrayItem';

describe('moveArrayItem', () => {
  it('should return an empty array if provided with empty array', () => {
    expect(moveArrayItem([], { fromIndex: 0, toIndex: 0 })).toEqual([]);
  });

  it('should return the same array if fromIndex is larger than array.length', () => {
    expect(moveArrayItem([1, 2], { fromIndex: 3, toIndex: 0 })).toEqual([1, 2]);
  });

  it('should return the same array if toIndex is larger than array.length', () => {
    expect(moveArrayItem([1, 2], { fromIndex: 0, toIndex: 3 })).toEqual([1, 2]);
  });

  it('should return the same array if fromIndex is smaller than 0', () => {
    expect(moveArrayItem([1, 2], { fromIndex: -1, toIndex: 0 })).toEqual([
      1, 2,
    ]);
  });

  it('should return the same array if toIndex is smaller than 0', () => {
    expect(moveArrayItem([1, 2], { fromIndex: 1, toIndex: -1 })).toEqual([
      1, 2,
    ]);
  });

  it('should move array items based on fromIndex and toIndex', () => {
    expect(moveArrayItem([1, 2, 3], { fromIndex: 0, toIndex: 1 })).toEqual([
      2, 1, 3,
    ]);
  });
});
