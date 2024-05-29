import { GraphQLInt, GraphQLFloat, GraphQLScalarType } from 'graphql';
import { GraphQLBigInt } from 'graphql-scalars';

import { NumberDataType } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

export const getNumberScalarType = (
  dataType: NumberDataType,
): GraphQLScalarType => {
  switch (dataType) {
    case NumberDataType.FLOAT:
      return GraphQLFloat;
    case NumberDataType.BIGINT:
      return GraphQLBigInt;
    case NumberDataType.INT:
      return GraphQLInt;
    default:
      return GraphQLFloat;
  }
};
