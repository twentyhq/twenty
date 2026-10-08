import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

describe('computeWhereConditionParts', () => {
  it('should generate accent-insensitive SQL for ilike operator using unaccent_immutable', () => {
    const result = computeWhereConditionParts({
      operator: 'ilike',
      objectNameSingular: 'company',
      key: 'name',
      value: '%geosynthese%',
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(result.sql).toMatch(
      /^public\.unaccent_immutable\("company"\."name"::text\) ILIKE public\.unaccent_immutable\(:name[a-f0-9]+\)$/,
    );
    const paramKey = Object.keys(result.params)[0];
    expect(result.params[paramKey]).toBe('%geosynthese%');
  });

  it('should generate accent-insensitive SQL for containsIlike operator using unaccent_immutable', () => {
    const result = computeWhereConditionParts({
      operator: 'containsIlike',
      objectNameSingular: 'company',
      key: 'tags',
      value: '%tech%',
      fieldMetadataType: FieldMetadataType.ARRAY,
    });

    expect(result.sql).toMatch(
      /^EXISTS \(SELECT 1 FROM unnest\("company"\."tags"\) AS elem WHERE public\.unaccent_immutable\(elem\) ILIKE public\.unaccent_immutable\(:tags[a-f0-9]+\)\)$/,
    );
    const paramKey = Object.keys(result.params)[0];
    expect(result.params[paramKey]).toBe('%tech%');
  });

  it('should support direct table references with unaccent_immutable for ilike', () => {
    const result = computeWhereConditionParts({
      operator: 'ilike',
      objectNameSingular: 'person',
      key: 'jobTitle',
      value: '%ingenieur%',
      fieldMetadataType: FieldMetadataType.TEXT,
      useDirectTableReference: true,
    });

    expect(result.sql).toMatch(
      /^public\.unaccent_immutable\("jobTitle"::text\) ILIKE public\.unaccent_immutable\(:jobTitle[a-f0-9]+\)$/,
    );
  });

  it('should parenthesize ilike condition when value is null-equivalent', () => {
    const result = computeWhereConditionParts({
      operator: 'ilike',
      objectNameSingular: 'company',
      key: 'name',
      value: '',
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(result.sql).toMatch(
      /^\(public\.unaccent_immutable\("company"\."name"::text\) ILIKE public\.unaccent_immutable\(:name[a-f0-9]+\) OR "company"\."name" IS NULL\)$/,
    );
  });
});
