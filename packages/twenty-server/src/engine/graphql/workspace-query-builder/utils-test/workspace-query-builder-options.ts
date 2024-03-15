import { GraphQLResolveInfo } from 'graphql';

import { ObjectMetadataInterface } from 'src/engine-metadata/field-metadata/interfaces/object-metadata.interface';
import { WorkspaceQueryBuilderOptions } from 'src/engine/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';

import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';

export const workspaceQueryBuilderOptions: WorkspaceQueryBuilderOptions = {
  fieldMetadataCollection: [],
  info: {} as GraphQLResolveInfo,
  objectMetadataCollection: [],
  objectMetadataItem: objectMetadataItem as ObjectMetadataInterface,
};
