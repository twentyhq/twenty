import { UseFilters } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import chunk from 'lodash.chunk';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GlobalSearchArgs } from 'src/engine/core-modules/global-search/dtos/global-search-args';
import { GlobalSearchRecordDTO } from 'src/engine/core-modules/global-search/dtos/global-search-record-dto';
import {
  GlobalSearchException,
  GlobalSearchExceptionCode,
} from 'src/engine/core-modules/global-search/exceptions/global-search.exception';
import { GlobalSearchApiExceptionFilter } from 'src/engine/core-modules/global-search/filters/global-search-api-exception.filter';
import { GlobalSearchService } from 'src/engine/core-modules/global-search/services/global-search.service';
import { RecordsWithObjectMetadataItem } from 'src/engine/core-modules/global-search/types/records-with-object-metadata-item';
import { formatSearchTerms } from 'src/engine/core-modules/global-search/utils/format-search-terms';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

const OBJECT_METADATA_ITEMS_CHUNK_SIZE = 5;

@Resolver(() => [GlobalSearchRecordDTO])
@UseFilters(GlobalSearchApiExceptionFilter)
export class GlobalSearchResolver {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly globalSearchService: GlobalSearchService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Query(() => [GlobalSearchRecordDTO])
  async globalSearch(
    @AuthWorkspace() workspace: Workspace,
    @Args()
    {
      searchInput,
      limit,
      filter,
      includedObjectNameSingulars,
      excludedObjectNameSingulars,
    }: GlobalSearchArgs,
  ) {
    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (currentCacheVersion === undefined) {
      throw new GlobalSearchException(
        'Metadata cache version not found',
        GlobalSearchExceptionCode.METADATA_CACHE_VERSION_NOT_FOUND,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspace.id,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new GlobalSearchException(
        `Object metadata map not found for workspace ${workspace.id} and metadata version ${currentCacheVersion}`,
        GlobalSearchExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    const featureFlagMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    const objectMetadataItemWithFieldMaps = Object.values(
      objectMetadataMaps.byId,
    );

    const filteredObjectMetadataItems =
      this.globalSearchService.filterObjectMetadataItems({
        objectMetadataItemWithFieldMaps,
        includedObjectNameSingulars: includedObjectNameSingulars ?? [],
        excludedObjectNameSingulars: excludedObjectNameSingulars ?? [],
      });

    const allRecordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[] =
      [];

    const filteredObjectMetadataItemsChunks = chunk(
      filteredObjectMetadataItems,
      OBJECT_METADATA_ITEMS_CHUNK_SIZE,
    );

    for (const objectMetadataItemChunk of filteredObjectMetadataItemsChunks) {
      const recordsWithObjectMetadataItems = await Promise.all(
        objectMetadataItemChunk.map(async (objectMetadataItem) => {
          const repository = await this.twentyORMManager.getRepository(
            objectMetadataItem.nameSingular,
          );

          return {
            objectMetadataItem,
            records:
              await this.globalSearchService.buildSearchQueryAndGetRecords({
                entityManager: repository,
                objectMetadataItem,
                featureFlagMap,
                searchTerms: formatSearchTerms(searchInput, 'and'),
                searchTermsOr: formatSearchTerms(searchInput, 'or'),
                limit,
                filter: filter ?? ({} as ObjectRecordFilter),
              }),
          };
        }),
      );

      allRecordsWithObjectMetadataItems.push(...recordsWithObjectMetadataItems);
    }

    return this.globalSearchService.computeSearchObjectResults(
      allRecordsWithObjectMetadataItems,
      limit,
    );
  }
}
