import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { SearchResultConnectionDTO } from 'src/engine/core-modules/search/dtos/search-result-connection.dto';
import { SearchApiExceptionFilter } from 'src/engine/core-modules/search/filters/search-api-exception.filter';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Resolver()
@UseFilters(SearchApiExceptionFilter, PreventNestToAutoLogGraphqlErrorsFilter)
@UsePipes(ResolverValidationPipe)
export class SearchResolver {
  constructor(
    private readonly searchService: SearchService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  @Query(() => SearchResultConnectionDTO)
  @UseGuards(WorkspaceAuthGuard)
  async search(
    @AuthWorkspace() workspace: Workspace,
    @Args()
    {
      searchInput,
      limit,
      filter,
      includedObjectNameSingulars,
      excludedObjectNameSingulars,
      after,
    }: SearchArgs,
  ) {
    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspace.id,
      );

    const filteredObjectMetadataItems =
      this.searchService.filterObjectMetadataItems({
        objectMetadataItemWithFieldMaps: Object.values(
          objectMetadataMaps.byId,
        ).filter(isDefined),
        includedObjectNameSingulars: includedObjectNameSingulars ?? [],
        excludedObjectNameSingulars: excludedObjectNameSingulars ?? [],
      });

    const allRecordsWithObjectMetadataItems =
      await this.searchService.getAllRecordsWithObjectMetadataItems({
        objectMetadataItemWithFieldMaps: filteredObjectMetadataItems,
        searchInput,
        limit,
        filter,
        includedObjectNameSingulars,
        excludedObjectNameSingulars,
        after,
      });

    return this.searchService.computeSearchObjectResults({
      recordsWithObjectMetadataItems: allRecordsWithObjectMetadataItems,
      workspaceId: workspace.id,
      limit,
      after,
    });
  }
}
