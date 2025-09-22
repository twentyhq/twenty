import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab.input';
import { type PageLayoutTabDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-tab.dto';
import {
  generatePageLayoutTabExceptionMessage,
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import { PageLayoutTabRestApiExceptionFilter } from 'src/engine/core-modules/page-layout/filters/page-layout-tab-rest-api-exception.filter';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutPermissionService } from 'src/engine/core-modules/page-layout/services/page-layout-permission.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/page-layout-tabs')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutTabRestApiExceptionFilter)
export class PageLayoutTabController {
  constructor(
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutPermissionService: PageLayoutPermissionService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
    @Query('pageLayoutId') pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    if (!isDefined(pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    const tabs = await this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );

    return this.pageLayoutPermissionService.applyPermissionsToTabs(
      tabs,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO | null> {
    const tab = await this.pageLayoutTabService.findByIdOrThrow(
      id,
      workspace.id,
    );

    const processedTabs =
      await this.pageLayoutPermissionService.applyPermissionsToTabs(
        [tab],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedTabs[0];
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.create(input, workspace.id);

    const processedTabs =
      await this.pageLayoutPermissionService.applyPermissionsToTabs(
        [tab],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedTabs[0];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.update(id, workspace.id, input);

    const processedTabs =
      await this.pageLayoutPermissionService.applyPermissionsToTabs(
        [tab],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedTabs[0];
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutTabDTO> {
    const tab = await this.pageLayoutTabService.delete(id, workspace.id);

    const processedTabs =
      await this.pageLayoutPermissionService.applyPermissionsToTabs(
        [tab],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedTabs[0];
  }
}
