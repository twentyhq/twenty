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

import { CreateViewInput } from 'src/engine/core-modules/view/dtos/inputs/create-view.input';
import { UpdateViewInput } from 'src/engine/core-modules/view/dtos/inputs/update-view.input';
import { type ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';
import {
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view.exception';
import { ViewRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-rest-api-exception.filter';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/views')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewRestApiExceptionFilter)
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Get()
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
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const view = await this.viewService.findById(id, workspace.id);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.VIEW_NOT_FOUND,
          ),
        },
      );
    }

    return view;
  }

  @Post()
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
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewDTO> {
    const updatedView = await this.viewService.update(id, workspace.id, input);

    return updatedView;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedView = await this.viewService.delete(id, workspace.id);

    return { success: isDefined(deletedView) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
