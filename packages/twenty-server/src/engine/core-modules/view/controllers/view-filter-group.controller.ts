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

import { CreateViewFilterGroupInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-filter-group.input';
import { UpdateViewFilterGroupInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-filter-group.input';
import { type ViewFilterGroupDTO } from 'src/engine/core-modules/view/dtos/view-filter-group.dto';
import {
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-filter-group.exception';
import { ViewFilterGroupRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-filter-group-rest-api-exception.filter';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/viewFilterGroups')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewFilterGroupRestApiExceptionFilter)
export class ViewFilterGroupController {
  constructor(
    private readonly viewFilterGroupService: ViewFilterGroupService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFilterGroupDTO[]> {
    if (viewId) {
      return this.viewFilterGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterGroupService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    const viewFilterGroup = await this.viewFilterGroupService.findById(
      id,
      workspace.id,
    );

    if (!isDefined(viewFilterGroup)) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
            ),
        },
      );
    }

    return viewFilterGroup;
  }

  @Post()
  async create(
    @Body() input: CreateViewFilterGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFilterGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO> {
    const updatedViewFilterGroup = await this.viewFilterGroupService.update(
      id,
      workspace.id,
      input,
    );

    return updatedViewFilterGroup;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewFilterGroup = await this.viewFilterGroupService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewFilterGroup) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
