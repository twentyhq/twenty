import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { GraphQLJSONObject } from 'graphql-type-json';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { SupportDriver } from 'src/engine/core-modules/environment/interfaces/support.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { AnalyticsTinybirdJwtMap } from 'src/engine/core-modules/analytics/entities/analytics-tinybird-jwts.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DemoEnvGuard } from 'src/engine/guards/demo.env.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { OriginHeader } from 'src/engine/decorators/auth/origin-header.decorator';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

const getHMACKey = (email?: string, key?: string | null) => {
  if (!email || !key) return null;

  const hmac = crypto.createHmac('sha256', key);

  return hmac.update(email).digest('hex');
};

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly environmentService: EnvironmentService,
    private readonly fileUploadService: FileUploadService,
    private readonly onboardingService: OnboardingService,
    private readonly userVarService: UserVarsService,
    private readonly fileService: FileService,
    private readonly analyticsService: AnalyticsService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  @Query(() => User)
  async currentUser(
    @AuthUser() { id: userId }: User,
    @OriginHeader() origin: string,
  ): Promise<User> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    await this.userService.hasUserAccessToWorkspaceOrThrow(
      userId,
      workspace.id,
    );

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['workspaces', 'workspaces.workspace'],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    return { ...user, currentWorkspace: workspace };
  }

  @ResolveField(() => GraphQLJSONObject)
  async userVars(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Record<string, any>> {
    const userVars = await this.userVarService.getAll({
      userId: user.id,
      workspaceId: workspace.id,
    });

    const userVarAllowList = [
      OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_EMAIL_ALIASES,
    ] as string[];

    const filteredMap = new Map(
      [...userVars].filter(([key]) => userVarAllowList.includes(key)),
    );

    return Object.fromEntries(filteredMap);
  }

  @ResolveField(() => WorkspaceMember, {
    nullable: true,
  })
  async workspaceMember(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WorkspaceMember | null> {
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (workspaceMember && workspaceMember.avatarUrl) {
      const avatarUrlToken = await this.fileService.encodeFileToken({
        workspaceMemberId: workspaceMember.id,
        workspaceId: workspace.id,
      });

      workspaceMember.avatarUrl = `${workspaceMember.avatarUrl}?token=${avatarUrlToken}`;
    }

    // TODO: Fix typing disrepency between Entity and DTO
    return workspaceMember as WorkspaceMember | null;
  }

  @ResolveField(() => [WorkspaceMember], {
    nullable: true,
  })
  async workspaceMembers(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WorkspaceMember[]> {
    const workspaceMembers =
      await this.userService.loadWorkspaceMembers(workspace);

    for (const workspaceMember of workspaceMembers) {
      if (workspaceMember.avatarUrl) {
        const avatarUrlToken = await this.fileService.encodeFileToken({
          workspaceMemberId: workspaceMember.id,
          workspaceId: workspace.id,
        });

        workspaceMember.avatarUrl = `${workspaceMember.avatarUrl}?token=${avatarUrlToken}`;
      }
    }

    // TODO: Fix typing disrepency between Entity and DTO
    return workspaceMembers as WorkspaceMember[];
  }

  @ResolveField(() => String, {
    nullable: true,
  })
  supportUserHash(@Parent() parent: User): string | null {
    if (this.environmentService.get('SUPPORT_DRIVER') !== SupportDriver.Front) {
      return null;
    }
    const key = this.environmentService.get('SUPPORT_FRONT_HMAC_KEY');

    return getHMACKey(parent.email, key);
  }

  @ResolveField(() => AnalyticsTinybirdJwtMap, { nullable: true })
  analyticsTinybirdJwts(@AuthWorkspace() workspace: Workspace | undefined) {
    return this.analyticsService.generateWorkspaceJwt(workspace?.id);
  }

  @Mutation(() => String)
  async uploadProfilePicture(
    @AuthUser() { id }: User,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    if (!id) {
      throw new Error('User not found');
    }

    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.ProfilePicture;

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId,
    });

    const fileToken = await this.fileService.encodeFileToken({
      workspaceId: workspaceId,
    });

    return `${paths[0]}?token=${fileToken}`;
  }

  @UseGuards(DemoEnvGuard)
  @Mutation(() => User)
  async deleteUser(@AuthUser() { id: userId }: User) {
    // Proceed with user deletion
    return this.userService.deleteUser(userId);
  }

  @ResolveField(() => OnboardingStatus)
  async onboardingStatus(
    @Parent() user: User,
    @OriginHeader() origin: string,
  ): Promise<OnboardingStatus> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    return this.onboardingService.getOnboardingStatus(user, workspace);
  }
}
