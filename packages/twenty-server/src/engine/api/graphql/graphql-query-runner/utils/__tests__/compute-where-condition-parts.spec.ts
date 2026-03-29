import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

describe('computeWhereConditionParts', () => {
  it('should generate neq SQL with AND IS NOT NULL for null-equivalent text values', () => {
    const result = computeWhereConditionParts({
      operator: 'neq',
      objectNameSingular: 'person',
      key: 'nameFirstName',
      value: '',
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(result.sql).toContain('"person"."nameFirstName" != :nameFirstName');
    expect(result.sql).toContain('AND "person"."nameFirstName" IS NOT NULL');
    const paramEntries = Object.entries(result.params);

    expect(paramEntries).toHaveLength(1);
    expect(paramEntries[0][0]).toMatch(/^nameFirstName[0-9a-f]{10}$/);
    expect(paramEntries[0][1]).toBe('');
  });

  it('should keep eq SQL null-equivalent behavior unchanged', () => {
    const result = computeWhereConditionParts({
      operator: 'eq',
      objectNameSingular: 'person',
      key: 'nameFirstName',
      value: '',
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(result.sql).toContain('"person"."nameFirstName" = :nameFirstName');
    expect(result.sql).toContain('OR "person"."nameFirstName" IS NULL');
  });
});
