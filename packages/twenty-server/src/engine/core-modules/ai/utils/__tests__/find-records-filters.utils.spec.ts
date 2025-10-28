import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

import {
  buildWhereConditions,
  parseFilterCondition,
} from 'src/engine/core-modules/ai/utils/find-records-filters.utils';

describe('find-records-filters.utils', () => {
  describe('parseFilterCondition', () => {
    it('should handle eq', () => {
      expect(parseFilterCondition({ eq: 10 })).toBe(10);
    });

    it('should handle neq', () => {
      expect(parseFilterCondition({ neq: 5 })).toEqual(Not(5));
    });

    it('should handle gt/gte/lt/lte', () => {
      expect(parseFilterCondition({ gt: 1 })).toEqual(MoreThan(1));
      expect(parseFilterCondition({ gte: 2 })).toEqual(MoreThanOrEqual(2));
      expect(parseFilterCondition({ lt: 3 })).toEqual(LessThan(3));
      expect(parseFilterCondition({ lte: 4 })).toEqual(LessThanOrEqual(4));
    });

    it('should handle in', () => {
      expect(parseFilterCondition({ in: ['a', 'b'] })).toEqual(In(['a', 'b']));
    });

    it('should handle like/ilike', () => {
      expect(parseFilterCondition({ like: '%foo%' })).toEqual(Like('%foo%'));
      expect(parseFilterCondition({ ilike: '%bar%' })).toEqual(ILike('%bar%'));
    });

    it('should handle startsWith', () => {
      expect(parseFilterCondition({ startsWith: 'pre' })).toEqual(Like('pre%'));
    });

    it('should handle is NULL and NOT_NULL', () => {
      expect(parseFilterCondition({ is: 'NULL' })).toEqual(IsNull());
      expect(parseFilterCondition({ is: 'NOT_NULL' })).toEqual(Not(IsNull()));
    });

    it('should handle isEmptyArray', () => {
      expect(parseFilterCondition({ isEmptyArray: true })).toEqual([]);
    });

    it('should handle containsIlike (uses Like with wildcards)', () => {
      const result = parseFilterCondition({ containsIlike: 'mid' });

      expect(result).toEqual(Like('%mid%'));
    });
  });

  describe('buildWhereConditions', () => {
    it('should build where conditions from mixed criteria', () => {
      const where = buildWhereConditions({
        // primitive values
        id: '123',
        active: true,
        count: 7,
        // skip falsy-empty values
        skipUndefined: undefined,
        skipNull: null,
        skipEmptyString: '',
        // operator objects
        name: { ilike: '%alpha%' },
        createdAt: { gte: '2024-01-01' },
        score: { lte: 99 },
        tags: { in: ['a', 'b'] },
        prefix: { startsWith: 'PRE' },
        nothing: { is: 'NULL' },
        notNothing: { is: 'NOT_NULL' },
        contains: { containsIlike: 'mid' },
        // nested relation-like object
        account: {
          name: { startsWith: 'ACME' },
          size: { gte: 100 },
          country: '', // should be omitted
        },
        // arrays should pass through when not an operator object
        list: [1, 2, 3],
      });

      expect(where.id).toBe('123');
      expect(where.active).toBe(true);
      expect(where.count).toBe(7);

      expect(where.name).toEqual(ILike('%alpha%'));
      expect(where.createdAt).toEqual(MoreThanOrEqual('2024-01-01'));
      expect(where.score).toEqual(LessThanOrEqual(99));
      expect(where.tags).toEqual(In(['a', 'b']));
      expect(where.prefix).toEqual(Like('PRE%'));
      expect(where.nothing).toEqual(IsNull());
      expect(where.notNothing).toEqual(Not(IsNull()));
      expect(where.contains).toEqual(Like('%mid%'));

      expect(where.account).toEqual({
        name: Like('ACME%'),
        size: MoreThanOrEqual(100),
      });

      expect(where.list).toEqual([1, 2, 3]);

      // Ensure skipped values are not present
      expect('skipUndefined' in where).toBe(false);
      expect('skipNull' in where).toBe(false);
      expect('skipEmptyString' in where).toBe(false);
    });
  });
});
