import { removeTypenames } from '~/utils/removeTypenames';

describe('removeTypenames', () => {
  it('removes __typename at every level of objects and arrays', () => {
    expect(
      removeTypenames({
        __typename: 'ViewFieldRelationScope',
        filters: [
          {
            __typename: 'ViewFieldRelationScopeFilter',
            id: 'filter-id',
            value: { selectedRecordIds: ['record-id'] },
          },
        ],
        limit: null,
      }),
    ).toEqual({
      filters: [
        { id: 'filter-id', value: { selectedRecordIds: ['record-id'] } },
      ],
      limit: null,
    });
  });

  it('leaves primitives, null and undefined as they are', () => {
    expect(removeTypenames('text')).toBe('text');
    expect(removeTypenames(null)).toBeNull();
    expect(removeTypenames(undefined)).toBeUndefined();
  });
});
