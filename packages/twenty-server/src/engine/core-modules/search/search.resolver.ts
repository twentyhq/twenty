import { UseFilters } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import chunk from 'lodash.chunk';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record-dto';
import {
  SearchException,
  SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';
import { SearchApiExceptionFilter } from 'src/engine/core-modules/search/filters/search-api-exception.filter';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { RecordsWithObjectMetadataItem } from 'src/engine/core-modules/search/types/records-with-object-metadata-item';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

const OBJECT_METADATA_ITEMS_CHUNK_SIZE = 5;

@Resolver(() => [SearchRecordDTO])
@UseFilters(SearchApiExceptionFilter)
export class SearchResolver {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly searchService: SearchService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Query(() => [SearchRecordDTO])
  async search(
    @AuthWorkspace() workspace: Workspace,
    @Args()
    {
      searchInput,
      limit,
      filter,
      includedObjectNameSingulars,
      excludedObjectNameSingulars,
    }: SearchArgs,
  ) {
    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (currentCacheVersion === undefined) {
      throw new SearchException(
        'Metadata cache version not found',
        SearchExceptionCode.METADATA_CACHE_VERSION_NOT_FOUND,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspace.id,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new SearchException(
        `Object metadata map not found for workspace ${workspace.id} and metadata version ${currentCacheVersion}`,
        SearchExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    const featureFlagMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    const objectMetadataItemWithFieldMaps = Object.values(
      objectMetadataMaps.byId,
    );

    const filteredObjectMetadataItems =
      this.searchService.filterObjectMetadataItems({
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
            records: await this.searchService.buildSearchQueryAndGetRecords({
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

    return this.searchService.computeSearchObjectResults(
      allRecordsWithObjectMetadataItems,
      limit,
      workspace.id,
    );
  }
}
