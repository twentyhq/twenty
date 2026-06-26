import { isEmptyGraphqlFilter } from 'src/engine/api/common/common-query-runners/utils/is-empty-graphql-filter.util';

describe('isEmptyGraphqlFilter', () => {
  describe('should treat as empty (rejected for bulk mutations)', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['{}', {}],
      ['{ and: [] }', { and: [] }],
      ['{ or: [] }', { or: [] }],
      ['{ not: {} }', { not: {} }],
      ['nested empty logical operators', { and: [{ or: [] }, { not: {} }] }],
      [
        'deeply nested empty logical operators',
        { and: [{ or: [{ not: {} }] }] },
      ],
    ])('treats %s as empty', (_label, filter) => {
      expect(isEmptyGraphqlFilter(filter)).toBe(true);
    });
  });

  describe('should treat as non-empty (allowed for bulk mutations)', () => {
    it.each([
      ['a scalar condition', { id: { eq: '123' } }],
      ['an and with a condition', { and: [{ id: { eq: '123' } }] }],
      ['an or with a condition', { or: [{ name: { ilike: '%foo%' } }] }],
      ['a not with a condition', { not: { id: { eq: '123' } } }],
      [
        'a real condition nested under logical operators',
        { and: [{ or: [{ id: { eq: '123' } }] }] },
      ],
    ])('treats %s as non-empty', (_label, filter) => {
      expect(isEmptyGraphqlFilter(filter)).toBe(false);
    });
  });
});
