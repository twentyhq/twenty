import { isDefined } from 'twenty-shared/utils';
export const recordGroupSortedInsert = <T>(
  array: T[],
  item: T,
  comparator: (a: T, b: T) => number,
) => {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const midItem = array[mid];

    if (!isDefined(midItem)) {
      break;
    }

    if (comparator(item, midItem) < 0) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  array.splice(low, 0, item);
};
