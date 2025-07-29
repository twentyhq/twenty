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

import { CreateViewInput } from 'src/engine/core-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/core-modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Controller('views')
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Get()
  @UseGuards(WorkspaceAuthGuard)
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('objectMetadataId') objectMetadataId?: string,
  ): Promise<ViewDTO[]> {
    if (objectMetadataId) {
      return this.viewService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.viewService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  @UseGuards(WorkspaceAuthGuard)
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO | null> {
    return this.viewService.findById(id, workspace.id);
  }

  @Post()
  @UseGuards(WorkspaceAuthGuard)
  async create(
    @Body() input: CreateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    return this.viewService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  @UseGuards(WorkspaceAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const updatedView = await this.viewService.update(id, workspace.id, input);

    if (!updatedView) {
      throw new Error('View not found');
    }

    return updatedView;
  }

  @Delete(':id')
  @UseGuards(WorkspaceAuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedView = await this.viewService.delete(id, workspace.id);

    return { success: !!deletedView };
  }
}
