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

import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { ViewFieldRestApiExceptionFilter } from 'src/engine/core-modules/view/filters/view-field-rest-api-exception.filter';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/viewFields')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ViewFieldRestApiExceptionFilter)
export class ViewFieldController {
  constructor(private readonly viewFieldService: ViewFieldService) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('viewId') viewId?: string,
  ): Promise<ViewFieldEntity[]> {
    if (viewId) {
      return this.viewFieldService.findByViewId(workspace.id, viewId);
    }

    return this.viewFieldService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity> {
    const viewField = await this.viewFieldService.findById(id, workspace.id);

    if (!isDefined(viewField)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
        {
          userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          ),
        },
      );
    }

    return viewField;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity> {
    const updatedViewField = await this.viewFieldService.update(
      id,
      workspace.id,
      input,
    );

    return updatedViewField;
  }

  @Post()
  async create(
    @Body() input: CreateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewFieldEntity> {
    return this.viewFieldService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<{ success: boolean }> {
    const deletedViewField = await this.viewFieldService.delete(
      id,
      workspace.id,
    );

    return { success: isDefined(deletedViewField) };
  }

  // TODO: the destroy endpoint will be implemented when we settle on a strategy
}
