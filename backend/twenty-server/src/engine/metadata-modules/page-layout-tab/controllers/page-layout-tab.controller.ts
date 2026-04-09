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

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import {
  generatePageLayoutTabExceptionMessage,
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { PageLayoutTabRestApiExceptionFilter } from 'src/engine/metadata-modules/page-layout-tab/filters/page-layout-tab-rest-api-exception.filter';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';

@Controller('rest/metadata/pageLayoutTabs')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutTabRestApiExceptionFilter)
export class PageLayoutTabController {
  constructor(private readonly pageLayoutTabService: PageLayoutTabService) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
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

    return this.pageLayoutTabService.findByPageLayoutId({
      workspaceId: workspace.id,
      pageLayoutId,
    });
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO | null> {
    return this.pageLayoutTabService.findByIdOrThrow({
      id,
      workspaceId: workspace.id,
    });
  }

  @Post()
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async create(
    @Body() input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create({
      createPageLayoutTabInput: input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update({
      id,
      workspaceId: workspace.id,
      updateData: input,
    });
  }

  @Delete(':id')
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.LAYOUTS))
  async destroy(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.pageLayoutTabService.destroy({
      id,
      workspaceId: workspace.id,
    });
  }
}
