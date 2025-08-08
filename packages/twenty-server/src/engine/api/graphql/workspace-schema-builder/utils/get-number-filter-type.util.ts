import { type GraphQLInputObjectType } from 'graphql';

import { NumberDataType } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import {
  BigIntFilterType,
  FloatFilterType,
  IntFilterType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input';

export const getNumberFilterType = (
  subType: NumberDataType | undefined,
): GraphQLInputObjectType => {
  switch (subType) {
    case NumberDataType.FLOAT:
      return FloatFilterType;
    case NumberDataType.BIGINT:
      return BigIntFilterType;
    case NumberDataType.INT:
      return IntFilterType;
    default:
      return FloatFilterType;
  }
};
