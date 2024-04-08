import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { assert } from 'src/utils/assert';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';
import { DemoEnvGuard } from 'src/engine/guards/demo.env.guard';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly fileUploadService: FileUploadService,
    private readonly billingService: BillingService,
  ) {}

  @Query(() => Workspace)
  async currentWorkspace(@AuthWorkspace() { id }: Workspace) {
    const workspace = await this.workspaceService.findById(id);

    assert(workspace, 'User not found');

    return workspace;
  }

  @Mutation(() => Workspace)
  @UseGuards(JwtAuthGuard)
  async activateWorkspace(
    @Args('data') data: ActivateWorkspaceInput,
    @AuthUser() user: User,
  ) {
    return await this.workspaceService.activateWorkspace(user, data);
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

  @UseGuards(DemoEnvGuard)
  @Mutation(() => Workspace)
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: Workspace) {
    return this.workspaceService.deleteWorkspace(id);
  }

  @ResolveField(() => String)
  async activationStatus(
    @Parent() workspace: Workspace,
  ): Promise<'active' | 'inactive'> {
    if (await this.workspaceService.isWorkspaceActivated(workspace.id)) {
      return 'active';
    }

    return 'inactive';
  }

  @ResolveField(() => String, { nullable: true })
  async currentCacheVersion(
    @Parent() workspace: Workspace,
  ): Promise<string | null> {
    return this.workspaceCacheVersionService.getVersion(workspace.id);
  }

  @ResolveField(() => BillingSubscription)
  async currentBillingSubscription(
    @Parent() workspace: Workspace,
  ): Promise<BillingSubscription | null> {
    return this.billingService.getCurrentBillingSubscription({
      workspaceId: workspace.id,
    });
  }
}
