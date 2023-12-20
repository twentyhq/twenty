import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { assert } from 'src/utils/assert';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateWorkspaceInput } from 'src/core/workspace/dtos/update-workspace-input';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly fileUploadService: FileUploadService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Query(() => Workspace)
  async currentWorkspace(@AuthWorkspace() { id }: Workspace) {
    const workspace = await this.workspaceService.findById(id);

    assert(workspace, 'User not found');

    return workspace;
  }

  @Mutation(() => Workspace)
  async updateWorkspace(
    @Args('data') data: UpdateWorkspaceInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.workspaceService.updateOne(workspace.id, data);
  }

  @Mutation(() => String)
  async uploadWorkspaceLogo(
    @AuthWorkspace() { id }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.WorkspaceLogo;

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
    });

    await this.workspaceService.updateOne(id, {
      logo: paths[0],
    });

    return paths[0];
  }

  @Mutation(() => Workspace)
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: Workspace) {
    const demoWorkspaceIds = this.environmentService.getDemoWorkspaceIds();

    // Check if the id is in the list of demo workspaceIds
    if (demoWorkspaceIds.includes(id)) {
      throw new ForbiddenException('Demo workspaces cannot be deleted.');
    }

    return this.workspaceService.deleteWorkspace(id);
  }
}
