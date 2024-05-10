type ToSplicedFn = {
  <T>(array: T[], start: number, deleteCount?: number): T[];
  <T>(array: T[], start: number, deleteCount: number, ...items: T[]): T[];
};

/**
 * Returns a new array with some elements removed and/or replaced at a given index.
 * This does the same as `Array.prototype.toSpliced`.
 * We cannot use the native `Array.prototype.toSpliced` method as of now because Chromatic's runners do not support it.
 *
 * @param array - The array to remove and/or replace elements from.
 * @param start - The index at which to start changing the array.
 * @param deleteCount - The number of elements in the array to remove from `start`.
 * @param items - The elements to add to the array at `start`.
 *
 * @returns A new array with elements removed and/or replaced at a given index.
 *
 * @example
 * toSpliced(['a', 'b', 'c'], 0, 1)
 * => ['b', 'c']
 * toSpliced(['a', 'b', 'c'], 0, 1, 'd')
 * => ['d', 'b', 'c']
 */
export const toSpliced: ToSplicedFn = (array, ...args) => {
  const arrayCopy = [...array];
  arrayCopy.splice(...(args as [number, number, ...any[]]));
  return arrayCopy;
};
