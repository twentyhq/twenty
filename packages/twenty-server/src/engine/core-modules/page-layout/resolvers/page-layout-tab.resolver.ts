import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab.input';
import { PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutPermissionService } from 'src/engine/core-modules/page-layout/services/page-layout-permission.service';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutGraphqlApiExceptionFilter } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception.filter';
import { transformTabsEntitiesToDTOs } from 'src/engine/core-modules/page-layout/utils/transform-tabs-entities-to-dtos.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver(() => PageLayoutTabDTO)
@UseFilters(PageLayoutGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class PageLayoutTabResolver {
  constructor(
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutPermissionService: PageLayoutPermissionService,
  ) {}

  @Query(() => [PageLayoutTabDTO])
  async getPageLayoutTabs(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
    @Args('pageLayoutId', { type: () => String }) pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    const tabs = await this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );

    return this.processTabsWithPermissions(
      tabs,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Query(() => PageLayoutTabDTO)
  async getPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.findByIdOrThrow(
      id,
      workspace.id,
    );

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  @Mutation(() => PageLayoutTabDTO)
  async createPageLayoutTab(
    @Args('input') input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.create(input, workspace.id);

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  @Mutation(() => PageLayoutTabDTO)
  async updatePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.update(id, workspace.id, input);

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  @Mutation(() => Boolean)
  async deletePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const deletedPageLayoutTab = await this.pageLayoutTabService.delete(
      id,
      workspace.id,
    );

    return isDefined(deletedPageLayoutTab);
  }

  @Mutation(() => Boolean)
  async destroyPageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    return this.pageLayoutTabService.destroy(id, workspace.id);
  }

  @Mutation(() => PageLayoutTabDTO)
  async restorePageLayoutTab(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.restore(id, workspace.id);

    const processedTabs = await this.processTabsWithPermissions(
      [tab],
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );

    return processedTabs[0];
  }

  private async processTabsWithPermissions(
    tabs: PageLayoutTabEntity[],
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ): Promise<PageLayoutTabDTO[]> {
    const permissions =
      await this.pageLayoutPermissionService.getUserPermissions(
        workspaceId,
        userWorkspaceId,
        apiKeyId,
      );

    return transformTabsEntitiesToDTOs(tabs, permissions);
  }
}
