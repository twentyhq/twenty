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

    return this.pageLayoutWidgetService.findByPageLayoutTabId(
      workspace.id,
      pageLayoutTabId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO | null> {
    return this.pageLayoutWidgetService.findByIdOrThrow(id, workspace.id);
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.create(input, workspace.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutWidgetInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.update(id, workspace.id, input);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutWidgetDTO> {
    return this.pageLayoutWidgetService.delete(id, workspace.id);
  }
}
