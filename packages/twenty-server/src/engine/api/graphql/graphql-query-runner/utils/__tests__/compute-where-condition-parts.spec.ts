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
        expectedParams: { jobTitle0000000000: 'Engineer' },
      },
      {
        description:
          'should exclude NULL values when compared to an empty value',
        key: 'jobTitle',
        value: '',
        fieldMetadataType: FieldMetadataType.TEXT,
        expectedSql: `("person"."jobTitle" != :jobTitle0000000000 AND "person"."jobTitle" IS NOT NULL)`,
        expectedParams: { jobTitle0000000000: '' },
      },
      {
        description:
          'should match NULL foreign keys when compared to a real id',
        key: 'companyId',
        value: '20202020-0000-4000-8000-000000000001',
        fieldMetadataType: FieldMetadataType.UUID,
        expectedSql: `("person"."companyId" != :companyId0000000000 OR "person"."companyId" IS NULL)`,
        expectedParams: {
          companyId0000000000: '20202020-0000-4000-8000-000000000001',
        },
      },
      {
        description: 'should match NULL dates when compared to a real date',
        key: 'createdAt',
        value: '2026-01-01T00:00:00.000Z',
        fieldMetadataType: FieldMetadataType.DATE_TIME,
        expectedSql: `("person"."createdAt" < :createdAt0000000000 OR "person"."createdAt" >= :createdAt0000000000::timestamptz + interval '1 millisecond' OR "person"."createdAt" IS NULL)`,
        expectedParams: { createdAt0000000000: '2026-01-01T00:00:00.000Z' },
      },
      {
        description: 'should exclude NULL text values when compared to null',
        key: 'jobTitle',
        value: null,
        fieldMetadataType: FieldMetadataType.TEXT,
        expectedSql: `("person"."jobTitle" != :jobTitle0000000000 AND "person"."jobTitle" IS NOT NULL)`,
        expectedParams: { jobTitle0000000000: '' },
      },
      {
        description: 'should match set foreign keys when compared to null',
        key: 'companyId',
        value: null,
        fieldMetadataType: FieldMetadataType.UUID,
        expectedSql: `"person"."companyId" IS NOT NULL`,
        expectedParams: {},
      },
      {
        description: 'should match set dates when compared to null',
        key: 'createdAt',
        value: null,
        fieldMetadataType: FieldMetadataType.DATE_TIME,
        expectedSql: `"person"."createdAt" IS NOT NULL`,
        expectedParams: {},
      },
    ])(
      '$description',
      ({ key, value, fieldMetadataType, expectedSql, expectedParams }) => {
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
          params: expectedParams,
        });
      },
    );
  });

  describe('DATE_TIME precision', () => {
    const microsecondValue = '2020-01-01T00:00:00.123900Z';

    it.each([
      {
        description: 'should compare gt exactly for a raw Postgres timestamp',
        operator: 'gt',
        value: '2020-01-01 00:00:00.1239+00',
        expectedSql: `"person"."createdAt" > :createdAt0000000000`,
      },
      {
        description:
          'should compare gt exactly when Postgres omits fractional seconds',
        operator: 'gt',
        value: '2020-01-01 00:00:00+00',
        expectedSql: `"person"."createdAt" > :createdAt0000000000`,
      },
      {
        description:
          'should compare gt exactly when Postgres trims fractional zeros',
        operator: 'gt',
        value: '2020-01-01 00:00:00.123+00',
        expectedSql: `"person"."createdAt" > :createdAt0000000000`,
      },
      {
        description:
          'should compare eqStrict exactly for a raw Postgres timestamp with an offset',
        operator: 'eqStrict',
        value: '2020-01-01 05:30:00.1239+05:30',
        expectedSql: `"person"."createdAt" = :createdAt0000000000`,
      },
      {
        description: 'should compare gt exactly for a microsecond cursor value',
        operator: 'gt',
        value: microsecondValue,
        expectedSql: `"person"."createdAt" > :createdAt0000000000`,
      },
      {
        description: 'should compare lt exactly for a microsecond cursor value',
        operator: 'lt',
        value: microsecondValue,
        expectedSql: `"person"."createdAt" < :createdAt0000000000`,
      },
      {
        description:
          'should compare eqStrict exactly for a microsecond cursor value',
        operator: 'eqStrict',
        value: microsecondValue,
        expectedSql: `"person"."createdAt" = :createdAt0000000000`,
      },
      {
        description:
          'should compare gt on millisecond buckets for a millisecond cursor value',
        operator: 'gt',
        value: '2020-01-01T00:00:00.123Z',
        expectedSql: `"person"."createdAt" >= :createdAt0000000000::timestamptz + interval '1 millisecond'`,
      },
      {
        description:
          'should compare eqStrict on millisecond buckets for a millisecond cursor value',
        operator: 'eqStrict',
        value: '2020-01-01T00:00:00.123Z',
        expectedSql: `("person"."createdAt" >= :createdAt0000000000 AND "person"."createdAt" < :createdAt0000000000::timestamptz + interval '1 millisecond')`,
      },
      {
        description: 'should compare lt exactly for a millisecond cursor value',
        operator: 'lt',
        value: '2020-01-01T00:00:00.123Z',
        expectedSql: `"person"."createdAt" < :createdAt0000000000`,
      },
      {
        description: 'should compare gt exactly when microseconds are zero',
        operator: 'gt',
        value: '2020-01-01T00:00:00.123000Z',
        expectedSql: `"person"."createdAt" > :createdAt0000000000`,
      },
      {
        description: 'should keep gt on millisecond buckets for a Date value',
        operator: 'gt',
        value: new Date('2020-01-01T00:00:00.123Z'),
        expectedSql: `"person"."createdAt" >= :createdAt0000000000::timestamptz + interval '1 millisecond'`,
      },
      {
        description:
          'should keep user-facing eq on millisecond buckets for a microsecond value',
        operator: 'eq',
        value: microsecondValue,
        expectedSql: `("person"."createdAt" >= :createdAt0000000000 AND "person"."createdAt" < :createdAt0000000000::timestamptz + interval '1 millisecond')`,
      },
    ])('$description', ({ operator, value, expectedSql }) => {
      expect(
        computeWhereConditionParts({
          operator,
          objectNameSingular: 'person',
          key: 'createdAt',
          value,
          fieldMetadataType: FieldMetadataType.DATE_TIME,
        }),
      ).toEqual({
        sql: expectedSql,
        params: { createdAt0000000000: value },
      });
    });
  });
});
