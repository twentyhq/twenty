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

import { CreateViewSortInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/core-modules/view/dtos/view-sort.dto';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('view-sorts')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewSortController {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
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
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewSortDTO | null> {
    return this.viewSortService.findById(id, workspace.id);
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
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
  @UseGuards(WorkspaceAuthGuard)
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

    if (!updatedViewSort) {
      throw new Error('ViewSort not found');
    }

    return updatedViewSort;
  }

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewSort = await this.viewSortService.delete(id, workspace.id);

    return { success: deletedViewSort !== null };
  }
}
