import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const MultiSelectFilterType = new GraphQLInputObjectType({
  name: 'MultiSelectFilter',
  fields: {
    containsAny: { type: new GraphQLList(GraphQLString) },
    is: { type: FilterIs },
    isEmptyArray: { type: GraphQLBoolean },
  },
});
