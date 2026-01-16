import {
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const FileObjectType = new GraphQLObjectType({
  name: 'File',
  fields: {
    fileId: { type: new GraphQLNonNull(UUIDScalarType) },
    label: { type: new GraphQLNonNull(GraphQLString) },
    fileType: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const FilesObjectType = new GraphQLList(FileObjectType);
