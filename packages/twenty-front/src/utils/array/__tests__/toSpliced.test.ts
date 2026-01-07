import { toSpliced } from '~/utils/array/toSpliced';

describe('toSpliced', () => {
  it('removes elements from the array starting at the given index', () => {
    // Given
    const array = ['a', 'b', 'c', 'd', 'e'];

    // When
    const result = toSpliced(array, 2, 2);

    // Then
    expect(result).toEqual(['a', 'b', 'e']);
  });

  it('replaces elements in the array starting at the given index', () => {
    // Given
    const array = ['a', 'b', 'c', 'd', 'e'];

    // When
    const result = toSpliced(array, 1, 2, 'x', 'y');

    // Then
    expect(result).toEqual(['a', 'x', 'y', 'd', 'e']);
  });

  it('returns a new array without modifying the original array', () => {
    // Given
    const array = ['a', 'b', 'c'];

    // When
    const result = toSpliced(array, 0, 1);

    // Then
    expect(result).toEqual(['b', 'c']);
    expect(array).toEqual(['a', 'b', 'c']);
  });
});
