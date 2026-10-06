import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: () => Buffer.from('0000000000', 'hex'),
}));

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
    it.each([
      {
        description: 'should match NULL values when compared to a real value',
        key: 'jobTitle',
        value: 'Engineer',
        fieldMetadataType: FieldMetadataType.TEXT,
        expectedSql: `("person"."jobTitle" != :jobTitle0000000000 OR "person"."jobTitle" IS NULL)`,
      },
      {
        description:
          'should exclude NULL values when compared to an empty value',
        key: 'jobTitle',
        value: '',
        fieldMetadataType: FieldMetadataType.TEXT,
        expectedSql: `("person"."jobTitle" != :jobTitle0000000000 AND "person"."jobTitle" IS NOT NULL)`,
      },
      {
        description:
          'should match NULL foreign keys when compared to a real id',
        key: 'companyId',
        value: '20202020-0000-4000-8000-000000000001',
        fieldMetadataType: FieldMetadataType.UUID,
        expectedSql: `("person"."companyId" != :companyId0000000000 OR "person"."companyId" IS NULL)`,
      },
      {
        description: 'should match NULL dates when compared to a real date',
        key: 'createdAt',
        value: '2026-01-01T00:00:00.000Z',
        fieldMetadataType: FieldMetadataType.DATE_TIME,
        expectedSql: `("person"."createdAt" < :createdAt0000000000 OR "person"."createdAt" >= :createdAt0000000000::timestamptz + interval '1 millisecond' OR "person"."createdAt" IS NULL)`,
      },
    ])('$description', ({ key, value, fieldMetadataType, expectedSql }) => {
      expect(
        computeWhereConditionParts({
          operator: 'neq',
          objectNameSingular: 'person',
          key,
          value,
          fieldMetadataType,
        }),
      ).toEqual({
        sql: expectedSql,
        params: { [`${key}0000000000`]: value },
      });
    });
  });
});
