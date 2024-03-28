import { GraphQLResolveInfo } from 'graphql';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';

export const workspaceQueryBuilderOptionsMock: WorkspaceQueryBuilderOptions = {
  fieldMetadataCollection: [],
  info: {} as GraphQLResolveInfo,
  objectMetadataCollection: [],
  objectMetadataItem: objectMetadataItemMock as ObjectMetadataInterface,
};
