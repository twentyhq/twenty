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

import { CreateViewFilterInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-filter.input';
import { type ViewFilterDTO } from 'src/engine/core-modules/view/dtos/view-filter.dto';
import { ViewFilterRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-filter-rest-api-exception.filter';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/viewFilters')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(ViewFilterRestApiExceptionFilter)
export class ViewFilterController {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  @Get()
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
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFilterDTO | null> {
    return this.viewFilterService.findById(id, workspace.id);
  }

  @Post()
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

    return updatedViewFilter;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewFilter = await this.viewFilterService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewFilter) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
