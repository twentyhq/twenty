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

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { CreateViewFilterInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/core-modules/view/dtos/view-filter.dto';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/view-filters')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class ViewFilterController {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFilterDTO[]> {
    if (viewId) {
      return this.viewFilterService.findByViewId(workspace.id, viewId);
    }

    return this.viewFilterService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO | null> {
    return this.viewFilterService.findById(id, workspace.id);
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    return this.viewFilterService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO> {
    const updatedViewFilter = await this.viewFilterService.update(
      id,
      workspace.id,
      input,
    );

    if (!updatedViewFilter) {
      throw new Error('ViewFilter not found');
    }

    return updatedViewFilter;
  }

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewFilter = await this.viewFilterService.delete(
      id,
      workspace.id,
    );

    return { success: deletedViewFilter !== null };
  }
}
