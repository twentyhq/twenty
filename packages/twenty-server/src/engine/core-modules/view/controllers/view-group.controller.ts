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

import { CreateViewGroupInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-group.input';
import { type ViewGroupDTO } from 'src/engine/core-modules/view/dtos/view-group.dto';
import {
  generateViewGroupExceptionMessage,
  generateViewGroupUserFriendlyExceptionMessage,
  ViewGroupException,
  ViewGroupExceptionCode,
  ViewGroupExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-group.exception';
import { ViewGroupRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-group-rest-api-exception.filter';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/viewGroups')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewGroupRestApiExceptionFilter)
export class ViewGroupController {
  constructor(private readonly viewGroupService: ViewGroupService) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewGroupDTO[]> {
    if (viewId) {
      return this.viewGroupService.findByViewId(workspace.id, viewId);
    }

    return this.viewGroupService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const viewGroup = await this.viewGroupService.findById(id, workspace.id);

    if (!isDefined(viewGroup)) {
      throw new ViewGroupException(
        generateViewGroupExceptionMessage(
          ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          id,
        ),
        ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
        {
          userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
            ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
          ),
        },
      );
    }

    return viewGroup;
  }

  @Post()
  async create(
    @Body() input: CreateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    return this.viewGroupService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewGroupInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewGroupDTO> {
    const updatedViewGroup = await this.viewGroupService.update(
      id,
      workspace.id,
      input,
    );

    return updatedViewGroup;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewGroup = await this.viewGroupService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewGroup) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
