import { GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';

export const SelectFilterType = new GraphQLInputObjectType({
  name: 'SelectFilter',
  fields: {
    in: { type: new GraphQLList(GraphQLString) },
    is: { type: FilterIs },
  },
});
