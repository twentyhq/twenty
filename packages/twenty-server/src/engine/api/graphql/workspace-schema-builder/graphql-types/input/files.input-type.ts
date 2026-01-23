import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const AddFileItemInputType = new GraphQLInputObjectType({
  name: 'AddFileItemInput',
  description: 'Input type for adding a new file to a FILES field',
  fields: {
    fileId: { type: new GraphQLNonNull(UUIDScalarType) },
    label: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const UpdateFileItemInputType = new GraphQLInputObjectType({
  name: 'UpdateFileItemInput',
  description:
    'Input type for updating a file (label property only) in a FILES field',
  fields: {
    fileId: { type: new GraphQLNonNull(UUIDScalarType) },
    label: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const RemoveFileItemInputType = new GraphQLInputObjectType({
  name: 'RemoveFileItemInput',
  fields: {
    fileId: { type: new GraphQLNonNull(UUIDScalarType) },
  },
});

export const FilesCreateInputType = new GraphQLInputObjectType({
  name: 'FilesCreateInput',
  fields: {
    addFiles: { type: new GraphQLList(AddFileItemInputType) },
  },
});

export const FilesUpdateInputType = new GraphQLInputObjectType({
  name: 'FilesUpdateInput',
  fields: {
    addFiles: { type: new GraphQLList(AddFileItemInputType) },
    removeFiles: { type: new GraphQLList(RemoveFileItemInputType) },
    updateFiles: { type: new GraphQLList(UpdateFileItemInputType) },
  },
});
