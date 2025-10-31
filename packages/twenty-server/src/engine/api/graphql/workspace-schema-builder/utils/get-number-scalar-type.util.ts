import { GraphQLInt, GraphQLFloat, type GraphQLScalarType } from 'graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { NumberDataType } from 'twenty-shared/types';

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
