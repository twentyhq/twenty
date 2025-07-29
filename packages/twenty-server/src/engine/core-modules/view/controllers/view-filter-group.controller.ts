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

import { CreateViewFilterGroupInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-filter-group.input';
import { UpdateViewFilterGroupInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-filter-group.input';
import { ViewFilterGroupDTO } from 'src/engine/core-modules/view/dtos/view-filter-group.dto';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('view-filter-groups')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFilterGroupController {
  constructor(
    private readonly viewFilterGroupService: ViewFilterGroupService,
  ) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
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
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterGroupDTO | null> {
    return this.viewFilterGroupService.findById(id, workspace.id);
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
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
  @UseGuards(WorkspaceAuthGuard)
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

    if (!updatedViewFilterGroup) {
      throw new Error('ViewFilterGroup not found');
    }

    return updatedViewFilterGroup;
  }

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewFilterGroup = await this.viewFilterGroupService.delete(
      id,
      workspace.id,
    );

    return { success: deletedViewFilterGroup !== null };
  }
}
