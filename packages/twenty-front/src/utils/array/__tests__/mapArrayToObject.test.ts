import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

describe('mapArrayToObject', () => {
  it('maps an array of objects to an object with computed keys', () => {
    // Given
    const array = [
      { id: '1', value: 'one' },
      { id: '2', value: 'two' },
      { id: '3', value: 'three' },
    ];
    const computeItemKey = ({ id }: { id: string }) => id;

    // When
    const result = mapArrayToObject(array, computeItemKey);

    // Then
    expect(result).toEqual({
      '1': { id: '1', value: 'one' },
      '2': { id: '2', value: 'two' },
      '3': { id: '3', value: 'three' },
    });
  });
});
