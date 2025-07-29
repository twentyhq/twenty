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

import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('view-fields')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFieldController {
  constructor(private readonly viewFieldService: ViewFieldService) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewField[]> {
    if (viewId) {
      return this.viewFieldService.findByViewId(workspace.id, viewId);
    }

    return this.viewFieldService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField | null> {
    return this.viewFieldService.findById(id, workspace.id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField> {
    const updatedViewField = await this.viewFieldService.update(
      id,
      workspace.id,
      input,
    );

    if (!updatedViewField) {
      throw new Error('ViewField not found');
    }

    return updatedViewField;
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField> {
    return this.viewFieldService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewField = await this.viewFieldService.delete(
      id,
      workspace.id,
    );

    return { success: !!deletedViewField };
  }
}
