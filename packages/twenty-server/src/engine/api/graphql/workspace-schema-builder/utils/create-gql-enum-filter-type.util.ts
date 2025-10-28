import {
  GraphQLBoolean,
  type GraphQLEnumType,
  GraphQLInputObjectType,
  type GraphQLInputType,
  GraphQLList,
} from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const createGqlEnumFilterType = (
  enumType: GraphQLEnumType,
): GraphQLInputType => {
  return new GraphQLInputObjectType({
    name: `${enumType.name}Filter`,
    fields: () => ({
      eq: { type: enumType },
      neq: { type: enumType },
      in: { type: new GraphQLList(enumType) },
      containsAny: { type: new GraphQLList(enumType) },
      is: { type: FilterIs },
      isEmptyArray: { type: GraphQLBoolean },
    }),
  });
};
