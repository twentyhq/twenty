import {
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { FILE_CATEGORIES } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const FileCategoryEnumType = new GraphQLEnumType({
  name: 'FileCategory',
  values: Object.fromEntries(
    Object.values(FILE_CATEGORIES).map((value) => [value, { value }]),
  ),
});

const FileObjectType = new GraphQLObjectType({
  name: 'FileObject',
  fields: {
    fileId: { type: new GraphQLNonNull(UUIDScalarType) },
    label: { type: new GraphQLNonNull(GraphQLString) },
    fileCategory: { type: FileCategoryEnumType },
    //TODO: Will be made non-nullable in a future PR
    // fileCategory: { type: new GraphQLNonNull(FileCategoryEnumType) },
  },
});

export const FilesObjectType = new GraphQLList(FileObjectType);
