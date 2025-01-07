import { UseGuards } from '@nestjs/common';
import { Args, Field, ID, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceInviteHashValidInput } from 'src/engine/core-modules/auth/dto/workspace-invite-hash.input';
import { WorkspaceInviteTokenInput } from 'src/engine/core-modules/auth/dto/workspace-invite-token.input';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@ObjectType()
export class MemberWorkspaceToggleStatusResponse extends WorkspaceMemberWorkspaceEntity {
  @Field()
  id: string;

  @Field()
  status: string;
}

@ObjectType()
export class MemberWorkspaceUpdateRoleResponse extends WorkspaceMemberWorkspaceEntity {
  @Field()
  id: string;

  @Field()
  roleId: string;
}


@UseGuards(WorkspaceAuthGuard)
@Resolver(() => UserWorkspace)
export class UserWorkspaceResolver {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
  ) {}

  @Mutation(() => User)
  async addUserToWorkspace(
    @AuthUser() user: User,
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ) {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash: workspaceInviteHashValidInput.inviteHash,
    });

    if (!workspace) {
      return;
    }

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      workspace.id,
      user.email,
    );

    return await this.userWorkspaceService.addUserToWorkspace(user, workspace);
  }

  @Mutation(() => User)
  async addUserToWorkspaceByInviteToken(
    @AuthUser() user: User,
    @Args() workspaceInviteTokenInput: WorkspaceInviteTokenInput,
  ) {
    return this.userWorkspaceService.addUserToWorkspaceByInviteToken(
      workspaceInviteTokenInput.inviteToken,
      user,
    );
  }

  @Mutation(() => MemberWorkspaceToggleStatusResponse)
  async toggleMemberStatus(
    @AuthUser() { id: userAuthId }: User,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ) {
    const currentWorkspaceMember =
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

    if (!userAuthId || !currentWorkspaceMember)
      throw new Error('User not found in workspace');

    await this.workspaceMemberService.toggleMemberStatus(
      currentWorkspaceMember.id,
      workspaceId,
    );

    return await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);
  }

  @Mutation(() => MemberWorkspaceUpdateRoleResponse)
  async updateMemberRole(
    @AuthUser() { id: userAuthId }: User,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
  ) {
    const currentWorkspaceMember =
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

    if (!userAuthId || !currentWorkspaceMember)
      throw new Error('User not found in workspace');

    await this.workspaceMemberService.updateMemberRole(
      currentWorkspaceMember.id,
      workspaceId,
      roleId,
    );

    return await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);
  }
}
