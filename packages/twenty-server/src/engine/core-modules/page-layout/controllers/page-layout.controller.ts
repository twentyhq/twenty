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

import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutRestApiExceptionFilter } from 'src/engine/core-modules/page-layout/filters/page-layout-rest-api-exception.filter';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/page-layouts')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutRestApiExceptionFilter)
export class PageLayoutController {
  constructor(private readonly pageLayoutService: PageLayoutService) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @Query('objectMetadataId') objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    if (isDefined(objectMetadataId)) {
      return this.pageLayoutService.findByObjectMetadataId(
        workspace.id,
        objectMetadataId,
      );
    }

    return this.pageLayoutService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO | null> {
    return this.pageLayoutService.findByIdOrThrow(id, workspace.id);
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    return this.pageLayoutService.create(input, workspace.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutDTO> {
    const updatedPageLayout = await this.pageLayoutService.update(
      id,
      workspace.id,
      input,
    );

    return updatedPageLayout;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PageLayoutEntity> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    return deletedPageLayout;
  }
}
