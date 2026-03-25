import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import { DateScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const DateFilterType = new GraphQLInputObjectType({
  name: 'DateFilter',
  fields: {
    eq: { type: DateScalarType },
    gt: { type: DateScalarType },
    gte: { type: DateScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(DateScalarType)) },
    lt: { type: DateScalarType },
    lte: { type: DateScalarType },
    neq: { type: DateScalarType },
    is: { type: FilterIs },
  },
});
