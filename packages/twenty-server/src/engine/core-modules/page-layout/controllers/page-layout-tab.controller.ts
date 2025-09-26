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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/page-layout-tabs')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutTabRestApiExceptionFilter)
export class PageLayoutTabController {
  constructor(private readonly pageLayoutTabService: PageLayoutTabService) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
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

    return this.pageLayoutTabService.findByPageLayoutId(
      workspace.id,
      pageLayoutId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO | null> {
    return this.pageLayoutTabService.findByIdOrThrow(id, workspace.id);
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.create(input, workspace.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutTabInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.update(id, workspace.id, input);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutTabDTO> {
    return this.pageLayoutTabService.delete(id, workspace.id);
  }
}
