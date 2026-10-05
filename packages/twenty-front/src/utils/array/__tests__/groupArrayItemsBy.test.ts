import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';

describe('groupArrayItemsBy', () => {
  it('groups an array of objects by a computed key', () => {
    const array = [
      { id: '1', type: 'fruit', value: 'apple' },
      { id: '2', type: 'fruit', value: 'banana' },
      { id: '3', type: 'vegetable', value: 'carrot' },
    ];
    const computeGroupKey = ({ type }: (typeof array)[0]) => type;

    const result = groupArrayItemsBy(array, computeGroupKey);

    expect(result).toEqual({
      fruit: [
        { id: '1', type: 'fruit', value: 'apple' },
        { id: '2', type: 'fruit', value: 'banana' },
      ],
      vegetable: [{ id: '3', type: 'vegetable', value: 'carrot' }],
    });
  });
});
