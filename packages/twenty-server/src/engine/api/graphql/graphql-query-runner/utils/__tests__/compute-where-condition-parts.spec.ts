import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

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
});
