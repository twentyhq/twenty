import { arrayToChunks } from '~/utils/array/arrayToChunks';

describe('arrayToChunks', () => {
  it('should split an array into subarrays of a given size', () => {
    expect(arrayToChunks([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
