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

import { BillingWorkspaceService } from 'src/engine/core-modules/billing/billing.workspace-service';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { SendInviteLink } from 'src/engine/core-modules/workspace/dtos/send-invite-link.entity';
import { SendInviteLinkInput } from 'src/engine/core-modules/workspace/dtos/send-invite-link.input';
import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DemoEnvGuard } from 'src/engine/guards/demo.env.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { assert } from 'src/utils/assert';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

import { Workspace, WorkspaceActivationStatus } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly fileUploadService: FileUploadService,
    private readonly billingWorkspaceService: BillingWorkspaceService,
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

  @ResolveField(() => WorkspaceActivationStatus)
  async activationStatus(
    @Parent() workspace: Workspace,
  ): Promise<WorkspaceActivationStatus> {
    if (workspace.activationStatus) {
      return workspace.activationStatus;
    }

    if (await this.workspaceService.isWorkspaceActivated(workspace.id)) {
      return WorkspaceActivationStatus.ACTIVE;
    }

    return WorkspaceActivationStatus.INACTIVE;
  }

  @ResolveField(() => String, { nullable: true })
  async currentCacheVersion(
    @Parent() workspace: Workspace,
  ): Promise<string | null> {
    return this.workspaceCacheVersionService.getVersion(workspace.id);
  }

  @ResolveField(() => BillingSubscription, { nullable: true })
  async currentBillingSubscription(
    @Parent() workspace: Workspace,
  ): Promise<BillingSubscription | null> {
    return this.billingWorkspaceService.getCurrentBillingSubscription({
      workspaceId: workspace.id,
    });
  }

  @ResolveField(() => Number)
  async workspaceMembersCount(
    @Parent() workspace: Workspace,
  ): Promise<number | undefined> {
    return await this.userWorkspaceService.getUserCount(workspace.id);
  }

  @Mutation(() => SendInviteLink)
  async sendInviteLink(
    @Args() sendInviteLinkInput: SendInviteLinkInput,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<SendInviteLink> {
    return await this.workspaceService.sendInviteLink(
      sendInviteLinkInput.emails,
      workspace,
      user,
    );
  }
}
