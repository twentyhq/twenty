import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

describe('computeWhereConditionParts', () => {
  describe('DATE_TIME precision (#20520)', () => {
    // DATE_TIME values are millisecond-precision in the app layer but stored as
    // microsecond timestamptz. Comparisons must truncate the column to
    // milliseconds so cursor pagination can advance over rows sharing a
    // millisecond.
    it.each(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])(
      'truncates the column to milliseconds for "%s"',
      (operator) => {
        const { sql } = computeWhereConditionParts({
          operator,
          objectNameSingular: 'noteTarget',
          key: 'updatedAt',
          value: '2026-02-18T09:18:30.061Z',
          fieldMetadataType: FieldMetadataType.DATE_TIME,
        });

        expect(sql).toContain(
          `date_trunc('milliseconds', "noteTarget"."updatedAt")`,
        );
      },
    );

    it('does not truncate non-DATE_TIME fields', () => {
      const { sql } = computeWhereConditionParts({
        operator: 'gt',
        objectNameSingular: 'person',
        key: 'name',
        value: 'John',
        fieldMetadataType: FieldMetadataType.TEXT,
      });

      expect(sql).not.toContain('date_trunc');
      expect(sql).toContain('"person"."name" >');
    });
  });
});
