import { type GraphQLResolveInfo } from 'graphql';

import { type WorkspaceQueryBuilderOptions } from 'src/engine/api/graphql/workspace-query-builder/interfaces/workspace-query-builder-options.interface';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const workspaceQueryBuilderOptionsMock: WorkspaceQueryBuilderOptions = {
  fieldMetadataCollection: [],
  info: {} as GraphQLResolveInfo,
  objectMetadataCollection: [],
  objectMetadataItem: objectMetadataItemMock as ObjectMetadataEntity,
};
