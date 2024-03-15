import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import { DateTimeScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const DatetimeFilterType = new GraphQLInputObjectType({
  name: 'DateTimeFilter',
  fields: {
    eq: { type: DateTimeScalarType },
    gt: { type: DateTimeScalarType },
    gte: { type: DateTimeScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(DateTimeScalarType)) },
    lt: { type: DateTimeScalarType },
    lte: { type: DateTimeScalarType },
    neq: { type: DateTimeScalarType },
    is: { type: FilterIs },
  },
});
