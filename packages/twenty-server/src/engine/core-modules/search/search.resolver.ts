import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { SearchResultConnectionDTO } from 'src/engine/core-modules/search/dtos/search-result-connection.dto';
import { SearchApiExceptionFilter } from 'src/engine/core-modules/search/filters/search-api-exception.filter';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Resolver()
@UseFilters(SearchApiExceptionFilter, PreventNestToAutoLogGraphqlErrorsFilter)
@UsePipes(ResolverValidationPipe)
@UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
export class SearchResolver {
  constructor(
    private readonly searchService: SearchService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly userRoleService: UserRoleService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  @Query(() => SearchResultConnectionDTO)
  async search(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspace.id,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byId,
    ).filter(isDefined);

    const filteredObjectMetadataItems =
      this.searchService.filterObjectMetadataItems({
        flatObjectMetadatas,
        includedObjectNameSingulars: includedObjectNameSingulars ?? [],
        excludedObjectNameSingulars: excludedObjectNameSingulars ?? [],
      });

    // TODO: move to a service
    let rolePermissionConfig: RolePermissionConfig | undefined;

    if (isDefined(apiKey)) {
      const roleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        apiKey.id,
        workspace.id,
      );

      if (isDefined(roleId)) {
        rolePermissionConfig = { unionOf: [roleId] };
      }
    } else if (isDefined(userWorkspaceId)) {
      const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
        userWorkspaceId,
        workspaceId: workspace.id,
      });

      if (isDefined(roleId)) {
        rolePermissionConfig = { unionOf: [roleId] };
      }
    }

    const allRecordsWithObjectMetadataItems =
      await this.searchService.getAllRecordsWithObjectMetadataItems({
        flatObjectMetadatas: filteredObjectMetadataItems,
        flatFieldMetadataMaps,
        searchInput,
        limit,
        filter,
        includedObjectNameSingulars,
        excludedObjectNameSingulars,
        after,
        workspaceId: workspace.id,
        rolePermissionConfig,
      });

    return this.searchService.computeSearchObjectResults({
      recordsWithObjectMetadataItems: allRecordsWithObjectMetadataItems,
      flatFieldMetadataMaps,
      workspaceId: workspace.id,
      limit,
      after,
    });
  }
}
