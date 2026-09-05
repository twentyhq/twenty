import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

describe('computeWhereConditionParts', () => {
  // Param names carry a random suffix per call, so assertions resolve the
  // generated placeholder instead of hardcoding it
  const computeSqlWithResolvedParam = ({
    operator,
    value = 'Acme',
    fieldMetadataType = FieldMetadataType.TEXT,
    key = 'name',
    subFieldKey,
  }: {
    operator: string;
    value?: unknown;
    fieldMetadataType?: FieldMetadataType;
    key?: string;
    subFieldKey?: string;
  }): { sql: string; paramValues: unknown[] } => {
    const { sql, params } = computeWhereConditionParts({
      operator,
      objectNameSingular: 'company',
      key,
      subFieldKey,
      value,
      fieldMetadataType,
    });

    const resolvedSql = Object.keys(params).reduce(
      (acc, paramName) => acc.split(`:${paramName}`).join(':param'),
      sql,
    );

    return { sql: resolvedSql, paramValues: Object.values(params) };
  };

  describe('case-insensitive keyset operators', () => {
    it('should compare the lowercased column against the lowercased cursor value', () => {
      expect(
        computeSqlWithResolvedParam({ operator: 'gtCaseInsensitive' }),
      ).toEqual({
        sql: 'LOWER("company"."name"::text) > LOWER(:param)',
        paramValues: ['Acme'],
      });

      expect(
        computeSqlWithResolvedParam({ operator: 'ltCaseInsensitive' }),
      ).toEqual({
        sql: 'LOWER("company"."name"::text) < LOWER(:param)',
        paramValues: ['Acme'],
      });

      expect(
        computeSqlWithResolvedParam({ operator: 'eqStrictCaseInsensitive' }),
      ).toEqual({
        sql: 'LOWER("company"."name"::text) = LOWER(:param)',
        paramValues: ['Acme'],
      });
    });

    it('should compare on the same expression the SQL ordering sorts a SELECT field by', () => {
      // LOWER() cannot take an enum column directly, which is why the ordering
      // casts it; the keyset predicate has to reach the very same expression
      const { sql } = computeSqlWithResolvedParam({
        operator: 'gtCaseInsensitive',
        value: 'MEDIUM',
        fieldMetadataType: FieldMetadataType.SELECT,
        key: 'priority',
      });

      expect(sql).toBe('LOWER("company"."priority"::text) > LOWER(:param)');
    });

    it('should cast a composite sub-column whose own type the caller cannot see', () => {
      // The filter parser reports the composite type (ACTOR), never the SELECT
      // of createdBy.source, so deriving the cast here would emit LOWER() on an
      // enum column and fail at the database instead of paginating
      const { sql } = computeSqlWithResolvedParam({
        operator: 'eqStrictCaseInsensitive',
        value: 'MANUAL',
        fieldMetadataType: FieldMetadataType.ACTOR,
        key: 'createdBySource',
        subFieldKey: 'source',
      });

      expect(sql).toBe(
        'LOWER("company"."createdBySource"::text) = LOWER(:param)',
      );
    });

    it('should not widen the comparison to empty values the ordering keeps out of the NULL block', () => {
      const { sql } = computeSqlWithResolvedParam({
        operator: 'eqStrictCaseInsensitive',
        value: '',
      });

      expect(sql).not.toContain('IS NULL');
    });
  });

  describe('range operators outside keyset pagination', () => {
    it('should keep comparing raw values', () => {
      expect(computeSqlWithResolvedParam({ operator: 'gt' }).sql).toBe(
        '"company"."name" > :param',
      );

      expect(computeSqlWithResolvedParam({ operator: 'lt' }).sql).toBe(
        '"company"."name" < :param',
      );

      expect(computeSqlWithResolvedParam({ operator: 'eqStrict' }).sql).toBe(
        '"company"."name" = :param',
      );
    });
  });
});
