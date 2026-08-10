import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import {
  INDEX_FILTER_COLUMN_BY_FILTER_FIELD,
  type IndexFilterInput,
} from 'src/engine/metadata-modules/index-metadata/dtos/index-filter.input';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type CursorConnection } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';
import { type CursorPagingInput } from 'src/engine/metadata-modules/pagination/dtos/cursor-paging.input';
import { applyMetadataFilterToItems } from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-query-builder.util';
import { findManyItemsWithCursorPagination } from 'src/engine/metadata-modules/pagination/utils/find-many-items-with-cursor-pagination.util';

export type IndexMetadataConnectionLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataEntity, 'id'>;
  filter: IndexFilterInput;
  paging: CursorPagingInput;
};

@Injectable()
export class IndexMetadataConnectionLoaderFactory {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  create(): DataLoader<
    IndexMetadataConnectionLoaderPayload,
    CursorConnection<IndexMetadataDTO>
  > {
    return new DataLoader<
      IndexMetadataConnectionLoaderPayload,
      CursorConnection<IndexMetadataDTO>
    >(async (dataLoaderParams: IndexMetadataConnectionLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;
      const { flatIndexMaps, flatObjectMetadataMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatIndexMaps', 'flatObjectMetadataMaps'],
          },
        );

      return dataLoaderParams.map(({ objectMetadata, paging, filter }) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: objectMetadata.id,
          flatEntityMaps: flatObjectMetadataMaps,
        });
        const flatIndexMetadatas =
          findManyFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityIds: flatObjectMetadata.indexMetadataIds,
            flatEntityMaps: flatIndexMaps,
          });
        const filteredFlatIndexMetadatas = applyMetadataFilterToItems({
          items: flatIndexMetadatas,
          filter,
          columnByFilterField: INDEX_FILTER_COLUMN_BY_FILTER_FIELD,
        });
        const connection = findManyItemsWithCursorPagination({
          items: filteredFlatIndexMetadatas,
          paging,
        });

        return {
          ...connection,
          edges: connection.edges.map((edge) => ({
            ...edge,
            node: {
              ...edge.node,
              indexFieldMetadatas: edge.node.flatIndexFieldMetadatas,
              createdAt: new Date(edge.node.createdAt),
              updatedAt: new Date(edge.node.updatedAt),
              indexWhereClause: edge.node.indexWhereClause ?? undefined,
              objectMetadataId: objectMetadata.id,
              workspaceId,
            },
          })),
        };
      });
    });
  }
}
