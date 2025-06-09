import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { SearchResultConnectionDTO } from 'src/engine/core-modules/search/dtos/search-result-connection.dto';
import { SearchApiExceptionFilter } from 'src/engine/core-modules/search/filters/search-api-exception.filter';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseFilters(SearchApiExceptionFilter)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

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
    const objectMetadataItemWithFieldMaps =
      await this.searchService.getObjectMetadataItemWithFieldMaps(workspace);

    const filteredObjectMetadataItems =
      this.searchService.filterObjectMetadataItems({
        objectMetadataItemWithFieldMaps,
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
