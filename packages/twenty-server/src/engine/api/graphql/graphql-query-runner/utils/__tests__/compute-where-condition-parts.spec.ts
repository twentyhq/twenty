import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from '../compute-where-condition-parts';

describe('computeWhereConditionParts', () => {
  describe('isEmptyArray', () => {
    it.each([FieldMetadataType.ARRAY, FieldMetadataType.MULTI_SELECT])(
      'should match NULL and empty %s values when true',
      (fieldMetadataType) => {
        expect(
          computeWhereConditionParts({
            operator: 'isEmptyArray',
            objectNameSingular: 'pet',
            key: 'traits',
            value: true,
            fieldMetadataType,
          }),
        ).toEqual({
          sql: `("pet"."traits" = '{}' OR "pet"."traits" IS NULL)`,
          params: {},
        });
      },
    );

    it.each([FieldMetadataType.ARRAY, FieldMetadataType.MULTI_SELECT])(
      'should exclude NULL and empty %s values when false',
      (fieldMetadataType) => {
        expect(
          computeWhereConditionParts({
            operator: 'isEmptyArray',
            objectNameSingular: 'pet',
            key: 'traits',
            value: false,
            fieldMetadataType,
          }),
        ).toEqual({
          sql: `("pet"."traits" IS NOT NULL AND "pet"."traits" != '{}')`,
          params: {},
        });
      },
    );
  });

  // Each field's condition reaches the query via its own andWhere() call with
  // no automatic parenthesization (TypeORM only wraps Brackets/array
  // conditions, not raw SQL strings - confirmed by reading
  // node_modules/typeorm/query-builder/QueryBuilder.js directly). So whenever
  // an operator's SQL contains an internal OR, the whole fragment must stay
  // self-contained in its own parentheses, or it leaks past an AND-ed sibling
  // filter at the same level: `{ a: { eq: "" }, b: { eq: "x" } }` would
  // otherwise compile to `a = '' OR a IS NULL AND b = 'x'`, which SQL parses
  // as `a = '' OR (a IS NULL AND b = 'x')` - silently dropping the b
  // constraint for every row where a happens to equal ''.
  describe('operators with a null-equivalent-value OR stay self-contained', () => {
    const PARENTHESIZED = /^\(.*\)$/;

    it('eq wraps its OR in parentheses when the value is null-equivalent', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'eq',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: '',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toContain('OR');
      expect(sql).toMatch(PARENTHESIZED);
    });

    it('is wraps its OR in parentheses when the value is null-equivalent', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'is',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: 'NULL',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toContain('OR');
      expect(sql).toMatch(PARENTHESIZED);
    });

    it('like wraps its OR in parentheses when the value is null-equivalent', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'like',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: '',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toContain('OR');
      expect(sql).toMatch(PARENTHESIZED);
    });

    it('ilike wraps its OR in parentheses when the value is null-equivalent', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'ilike',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: '',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toContain('OR');
      expect(sql).toMatch(PARENTHESIZED);
    });

    it('eq does not add a spurious OR or parens for a real, non-empty value', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'eq',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: 'Engineer',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).not.toContain('OR');
    });
  });
});
