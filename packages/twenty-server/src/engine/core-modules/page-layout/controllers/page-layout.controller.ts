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

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutRestApiExceptionFilter } from 'src/engine/core-modules/page-layout/filters/page-layout-rest-api-exception.filter';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { PageLayoutPermissionService } from 'src/engine/core-modules/page-layout/services/page-layout-permission.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/metadata/page-layouts')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PageLayoutRestApiExceptionFilter)
export class PageLayoutController {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutPermissionService: PageLayoutPermissionService,
  ) {}

  @Get()
  async findMany(
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
    @Query('objectMetadataId') objectMetadataId?: string,
  ): Promise<PageLayoutDTO[]> {
    const layouts = isDefined(objectMetadataId)
      ? await this.pageLayoutService.findByObjectMetadataId(
          workspace.id,
          objectMetadataId,
        )
      : await this.pageLayoutService.findByWorkspaceId(workspace.id);

    return this.pageLayoutPermissionService.applyPermissionsToLayouts(
      layouts,
      workspace.id,
      userWorkspaceId,
      apiKey?.id,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO | null> {
    const layout = await this.pageLayoutService.findByIdOrThrow(
      id,
      workspace.id,
    );

    const processedLayouts =
      await this.pageLayoutPermissionService.applyPermissionsToLayouts(
        [layout],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedLayouts[0];
  }

  @Post()
  async create(
    @Body() input: CreatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const layout = await this.pageLayoutService.create(input, workspace.id);

    const processedLayouts =
      await this.pageLayoutPermissionService.applyPermissionsToLayouts(
        [layout],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedLayouts[0];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePageLayoutInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const updatedPageLayout = await this.pageLayoutService.update(
      id,
      workspace.id,
      input,
    );

    const processedLayouts =
      await this.pageLayoutPermissionService.applyPermissionsToLayouts(
        [updatedPageLayout],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedLayouts[0];
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKey | undefined,
  ): Promise<PageLayoutDTO> {
    const deletedPageLayout = await this.pageLayoutService.delete(
      id,
      workspace.id,
    );

    const processedLayouts =
      await this.pageLayoutPermissionService.applyPermissionsToLayouts(
        [deletedPageLayout],
        workspace.id,
        userWorkspaceId,
        apiKey?.id,
      );

    return processedLayouts[0];
  }
}
