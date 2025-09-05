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

import { CreateViewSortInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-sort.input';
import { type ViewSortDTO } from 'src/engine/core-modules/view/dtos/view-sort.dto';
import {
  ViewSortException,
  ViewSortExceptionCode,
  ViewSortExceptionMessageKey,
  generateViewSortExceptionMessage,
  generateViewSortUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-sort.exception';
import { ViewSortRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-sort-rest-api-exception.filter';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/viewSorts')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewSortRestApiExceptionFilter)
export class ViewSortController {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewSortDTO[]> {
    if (viewId) {
      return this.viewSortService.findByViewId(workspace.id, viewId);
    }

    return this.viewSortService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    const viewSort = await this.viewSortService.findById(id, workspace.id);

    if (!isDefined(viewSort)) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          id,
        ),
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        {
          userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          ),
        },
      );
    }

    return viewSort;
  }

  @Post()
  async create(
    @Body() input: CreateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    return this.viewSortService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewSortInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO> {
    const updatedViewSort = await this.viewSortService.update(
      id,
      workspace.id,
      input,
    );

    return updatedViewSort;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewSort = await this.viewSortService.delete(id, workspace.id);

    return { success: isDefined(deletedViewSort) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
