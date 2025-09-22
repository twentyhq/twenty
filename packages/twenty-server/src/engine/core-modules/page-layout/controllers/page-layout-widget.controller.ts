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

import { isDefined } from 'class-validator';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { type PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import {
  generatePageLayoutWidgetExceptionMessage,
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
import { PageLayoutWidgetRestApiExceptionFilter } from 'src/engine/core-modules/page-layout/filters/page-layout-widget-rest-api-exception.filter';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/page-layout-widgets')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutWidgetRestApiExceptionFilter)
export class PageLayoutWidgetController {
  constructor(
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
    @Query('pageLayoutTabId') pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetDTO[]> {
    if (!isDefined(pageLayoutTabId)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    return this.pageLayoutWidgetService.findByPageLayoutTabIdWithPermissions(
      workspace.id,
      pageLayoutTabId,
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
  ): Promise<PageLayoutWidgetDTO | null> {
    return this.pageLayoutWidgetService.findByIdOrThrowWithPermissions(
      id,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.createWithPermissions(
      input,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.updateWithPermissions(
      id,
      workspace.id,
      input,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.deleteWithPermissions(
      id,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }
}
