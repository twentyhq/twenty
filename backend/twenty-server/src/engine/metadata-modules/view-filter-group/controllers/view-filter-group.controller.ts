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

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { type UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import {
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { ViewFilterGroupRestApiExceptionFilter } from 'src/engine/metadata-modules/view-filter-group/filters/view-filter-group-rest-api-exception.filter';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { CreateViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-filter-group-permission.guard';
import { DeleteViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-filter-group-permission.guard';
import { UpdateViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-filter-group-permission.guard';

@Controller('rest/metadata/viewFilterGroups')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewFilterGroupRestApiExceptionFilter)
export class ViewFilterGroupController {
  constructor(
    private readonly viewFilterGroupService: ViewFilterGroupService,
  ) {}

  @Get()
  @UseGuards(NoPermissionGuard)
  async findMany(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFilterGroupDTO[]> {
    if (viewId) {
      return this.viewFilterGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterGroupService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(NoPermissionGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
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
  @UseGuards(CreateViewFilterGroupPermissionGuard)
  async create(
    @Body() input: CreateViewFilterGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.createOne({
      createViewFilterGroupInput: input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(UpdateViewFilterGroupPermissionGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFilterGroupInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ViewFilterGroupDTO> {
    return this.viewFilterGroupService.updateOne({
      id,
      updateViewFilterGroupInput: input,
      workspaceId: workspace.id,
    });
  }

  @Delete(':id')
  @UseGuards(DeleteViewFilterGroupPermissionGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ success: boolean }> {
    const deletedViewFilterGroup = await this.viewFilterGroupService.deleteOne({
      deleteViewFilterGroupInput: { id },
      workspaceId: workspace.id,
    });

    return { success: isDefined(deletedViewFilterGroup) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
