import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DemoEnvGuard } from 'src/engine/guards/demo.env.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { assert } from 'src/utils/assert';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  @Query(() => Workspace)
  async currentWorkspace(@AuthWorkspace() { id }: Workspace) {
    const workspace = await this.workspaceService.findById(id);

    assert(workspace, 'User not found');

    return workspace;
  }

  @Mutation(() => Workspace)
  @UseGuards(UserAuthGuard)
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
      workspaceId: id,
    });

    await this.workspaceService.updateOne(id, {
      logo: paths[0],
    });

    const workspaceLogoToken = await this.fileService.encodeFileToken({
      workspace_id: id,
    });

    return `${paths[0]}?token=${workspaceLogoToken}`;
  }

  @UseGuards(DemoEnvGuard)
  @Mutation(() => Workspace)
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: Workspace) {
    return this.workspaceService.deleteWorkspace(id);
  }

  @ResolveField(() => BillingSubscription, { nullable: true })
  async currentBillingSubscription(
    @Parent() workspace: Workspace,
  ): Promise<BillingSubscription | null> {
    return this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );
  }

  @ResolveField(() => Number)
  async workspaceMembersCount(
    @Parent() workspace: Workspace,
  ): Promise<number | undefined> {
    return await this.userWorkspaceService.getUserCount(workspace.id);
  }

  @ResolveField(() => String)
  async logo(@Parent() workspace: Workspace): Promise<string> {
    if (workspace.logo) {
      try {
        const workspaceLogoToken = await this.fileService.encodeFileToken({
          workspace_id: workspace.id,
        });

        return `${workspace.logo}?token=${workspaceLogoToken}`;
      } catch (e) {
        return workspace.logo;
      }
    }

    return workspace.logo ?? '';
  }
}
