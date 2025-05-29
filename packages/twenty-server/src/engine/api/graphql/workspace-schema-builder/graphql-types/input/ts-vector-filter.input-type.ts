import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { FilterIs } from './filter-is.input-type';

export const TSVectorFilterType = new GraphQLInputObjectType({
  name: 'TSVectorFilter',
  fields: {
    contains: { type: GraphQLString },
    matches: { type: GraphQLString },
    containsAny: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    containsAll: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    fuzzy: { type: GraphQLString },
    is: { type: FilterIs },
  },
});
