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

  describe('neq', () => {
    it('matches NULL rows when compared against a real, non-empty value', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'neq',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: 'Engineer',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toContain('IS NULL');
    });

    // The whole fragment must stay self-contained parentheses: each field's
    // condition is appended to the query via its own andWhere() call with no
    // automatic wrapping (TypeORM only parenthesizes Brackets/arrays, not raw
    // SQL strings), so an un-parenthesized OR here would leak past an AND-ed
    // sibling filter at the same level instead of staying scoped to this field.
    it('keeps the OR self-contained in its own parentheses', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'neq',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: 'Engineer',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toMatch(/^\(.*\)$/);
    });

    it('still excludes NULL rows when compared against the null-equivalent (empty) value', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'neq',
        objectNameSingular: 'person',
        key: 'jobTitle',
        value: '',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).toContain('IS NOT NULL');
      expect(sql).not.toContain('OR');
    });

    it('matches NULL rows for DATE_TIME fields compared against a real value', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'neq',
        objectNameSingular: 'task',
        key: 'dueAt',
        value: '2026-01-01T00:00:00.000Z',
        fieldMetadataType: FieldMetadataType.DATE_TIME,
      });

      expect(sql).toContain('IS NULL');
    });

    it('matches NULL relation foreign keys compared against a real id', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'neq',
        objectNameSingular: 'person',
        key: 'companyId',
        value: '11111111-1111-1111-1111-111111111111',
        fieldMetadataType: FieldMetadataType.UUID,
      });

      expect(sql).toContain('IS NULL');
    });
  });
});
