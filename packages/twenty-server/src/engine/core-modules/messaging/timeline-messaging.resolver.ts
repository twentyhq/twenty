import { UseGuards } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Field,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { Max } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TIMELINE_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { DismissReconnectAccountBannerInput } from 'src/engine/core-modules/messaging/dtos/dismiss-reconnect-account-banner.input';
import { TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@ArgsType()
class GetTimelineThreadsFromPersonIdArgs {
  @Field(() => UUIDScalarType)
  personId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineThreadsFromCompanyIdArgs {
  @Field(() => UUIDScalarType)
  companyId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineThreadsFromOpportunityIdArgs {
  @Field(() => UUIDScalarType)
  opportunityId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

@UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
@Resolver(() => TimelineThreadsWithTotalDTO)
export class TimelineMessagingResolver {
  constructor(
    private readonly getMessagesFromPersonIdsService: GetMessagesService,
    private readonly userService: UserService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  @Query(() => TimelineThreadsWithTotalDTO)
  async getTimelineThreadsFromPersonId(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { personId, page, pageSize }: GetTimelineThreadsFromPersonIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.getMessagesFromPersonIdsService.getMessagesFromPersonIds(
        workspaceMember.id,
        [personId],
        workspace.id,
        page,
        pageSize,
      );

    return timelineThreads;
  }

  @Query(() => TimelineThreadsWithTotalDTO)
  async getTimelineThreadsFromCompanyId(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { companyId, page, pageSize }: GetTimelineThreadsFromCompanyIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.getMessagesFromPersonIdsService.getMessagesFromCompanyId(
        workspaceMember.id,
        companyId,
        workspace.id,
        page,
        pageSize,
      );

    return timelineThreads;
  }

  @Query(() => TimelineThreadsWithTotalDTO)
  async getTimelineThreadsFromOpportunityId(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args()
    { opportunityId, page, pageSize }: GetTimelineThreadsFromOpportunityIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.getMessagesFromPersonIdsService.getMessagesFromOpportunityId(
        workspaceMember.id,
        opportunityId,
        workspace.id,
        page,
        pageSize,
      );

    return timelineThreads;
  }

  @Mutation(() => Boolean)
  async dismissReconnectAccountBanner(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { connectedAccountId }: DismissReconnectAccountBannerInput,
  ): Promise<boolean> {
    await this.accountsToReconnectService.removeAccountToReconnect(
      user.id,
      workspace.id,
      connectedAccountId,
    );

    return true;
  }
}
