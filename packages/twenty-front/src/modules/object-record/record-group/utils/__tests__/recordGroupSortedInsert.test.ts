// export const recordGroupSortedInsert = <T>(
//   array: T[],
//   item: T,
//   comparator: (a: T, b: T) => number,
// ) => {
//   let low = 0;
//   let high = array.length;

import { expect } from '@storybook/test';

//   while (low < high) {
//     const mid = Math.floor((low + high) / 2);

//     if (comparator(item, array[mid]) < 0) {
//       high = mid;
//     } else {
//       low = mid + 1;
//     }
//   }

//   array.splice(low, 0, item);
// };

import { recordGroupSortedInsert } from '../recordGroupSortedInsert';

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
