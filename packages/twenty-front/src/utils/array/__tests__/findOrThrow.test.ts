import { findOrThrow } from '~/utils/array/findOrThrow';

describe('findOrThrow', () => {
  it('should return the element that matches the predicate', () => {
    const array = [1, 2, 3, 4];
    const predicate = (num: number) => num === 3;

    const result = findOrThrow(array, predicate);

    expect(result).toBe(3);
  });

  it('should throw an error if no element matches the predicate', () => {
    const array = [1, 2, 3, 4];
    const predicate = (num: number) => num === 5;

    expect(() => findOrThrow(array, predicate)).toThrow('Element not found');
  });

  it('should work with non-numeric data types', () => {
    const array = ['apple', 'banana', 'cherry'];
    const predicate = (fruit: string) => fruit === 'banana';

    const result = findOrThrow(array, predicate);

    expect(result).toBe('banana');
  });

  it('should throw an error if the array is empty', () => {
    const array: number[] = [];
    const predicate = (num: number) => num === 1;

    expect(() => findOrThrow(array, predicate)).toThrow('Element not found');
  });

  it('should throw an error if predicate is never satisfied', () => {
    const array = [1, 2, 3];
    const predicate = (num: number) => num > 10;

    expect(() => findOrThrow(array, predicate)).toThrow('Element not found');
  });
});
