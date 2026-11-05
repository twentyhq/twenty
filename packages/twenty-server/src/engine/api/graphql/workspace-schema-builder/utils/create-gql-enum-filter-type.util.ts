import {
  GraphQLBoolean,
  type GraphQLEnumType,
  GraphQLInputObjectType,
  type GraphQLInputType,
  GraphQLList,
} from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import { getGqlEnumFilterTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-gql-enum-filter-type-name.util';

export const createGqlEnumFilterType = (
  enumType: GraphQLEnumType,
): GraphQLInputType => {
  return new GraphQLInputObjectType({
    name: getGqlEnumFilterTypeName(enumType.name),
    fields: () => ({
      eq: { type: enumType },
      neq: { type: enumType },
      in: { type: new GraphQLList(enumType) },
      containsAny: { type: new GraphQLList(enumType) },
      is: { type: FilterIs },
      isEmptyArray: { type: GraphQLBoolean },
      gt: { type: enumType },
      gte: { type: enumType },
      lt: { type: enumType },
      lte: { type: enumType },
    }),
  });
};
