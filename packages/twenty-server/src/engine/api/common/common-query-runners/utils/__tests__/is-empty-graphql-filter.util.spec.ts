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
    ])('treats %s as non-empty', (_label, filter) => {
      expect(isEmptyGraphqlFilter(filter)).toBe(false);
    });
  });

  describe('recursion depth guard', () => {
    const nest = (depth: number, leaf: object) => {
      let filter: object = leaf;

      for (let level = 0; level < depth; level++) {
        filter = { and: [filter] };
      }

      return filter;
    };

    it('does not overflow the stack and fails safe (empty) for pathologically deep nesting, even with a real condition at the bottom', () => {
      const deeplyNested = nest(1000, { id: { eq: '123' } });

      // Must not throw (no stack overflow) and must not silently allow the op:
      // beyond the depth bound the filter is treated as empty -> rejected.
      expect(isEmptyGraphqlFilter(deeplyNested)).toBe(true);
    });

    it('still evaluates real conditions within a reasonable nesting depth', () => {
      expect(isEmptyGraphqlFilter(nest(5, { id: { eq: '123' } }))).toBe(false);
    });
  });
});
