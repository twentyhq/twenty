import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const FileObjectType = new GraphQLObjectType({
  name: 'FileObject',
  fields: {
    fileId: { type: new GraphQLNonNull(UUIDScalarType) },
    label: { type: new GraphQLNonNull(GraphQLString) },
    extension: { type: GraphQLString },
    //TODO: Will be made non-nullable in a future PR
    // extension: { type: new GraphQLNonNull(GraphQLString) },
    token: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const FilesObjectType = new GraphQLList(FileObjectType);
