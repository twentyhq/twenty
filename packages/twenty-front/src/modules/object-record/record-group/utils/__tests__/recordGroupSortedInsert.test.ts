import { recordGroupSortedInsert } from '@/object-record/record-group/utils/recordGroupSortedInsert';

describe('recordGroupSortedInsert', () => {
  it('should insert an item into an empty array', () => {
    const array: number[] = [];
    const item = 1;
    const comparator = (a: number, b: number) => a - b;

    recordGroupSortedInsert(array, item, comparator);

    expect(array).toEqual([1]);
  });

  it('should insert an item at the beginning of the array', () => {
    const array = [2, 3, 4];
    const item = 1;
    const comparator = (a: number, b: number) => a - b;

    recordGroupSortedInsert(array, item, comparator);

    expect(array).toEqual([1, 2, 3, 4]);
  });

  it('should insert an item at the end of the array', () => {
    const array = [1, 2, 3];
    const item = 4;
    const comparator = (a: number, b: number) => a - b;

    recordGroupSortedInsert(array, item, comparator);

    expect(array).toEqual([1, 2, 3, 4]);
  });

  it('should insert an item in the middle of the array', () => {
    const array = [1, 3, 4];
    const item = 2;
    const comparator = (a: number, b: number) => a - b;

    recordGroupSortedInsert(array, item, comparator);

    expect(array).toEqual([1, 2, 3, 4]);
  });
});
