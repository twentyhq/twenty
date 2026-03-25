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
    url: { type: GraphQLString },
  },
});

export const FilesObjectType = new GraphQLList(FileObjectType);
