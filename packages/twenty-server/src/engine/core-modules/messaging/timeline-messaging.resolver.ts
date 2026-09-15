import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Field, Int, Mutation, Query } from '@nestjs/graphql';

import { Max } from 'class-validator';
import { PermissionFlagType } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TIMELINE_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { DismissReconnectAccountBannerInput } from 'src/engine/core-modules/messaging/dtos/dismiss-reconnect-account-banner.input';
import { TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@ArgsType()
class GetTimelineThreadsFromObjectRecordArgs {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => UUIDScalarType)
  recordId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

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
@CoreResolver(() => TimelineThreadsWithTotalDTO)
export class TimelineMessagingResolver {
  constructor(
    private readonly getMessagesFromPersonIdsService: GetMessagesService,
    private readonly userService: UserService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  @Query(() => TimelineThreadsWithTotalDTO)
  async getTimelineThreadsFromObjectRecord(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args()
    {
      objectNameSingular,
      recordId,
      page,
      pageSize,
    }: GetTimelineThreadsFromObjectRecordArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!workspaceMember) {
      return;
    }

    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord(
      workspaceMember.id,
      objectNameSingular,
      recordId,
      workspace.id,
      page,
      pageSize,
    );
  }

  @Query(() => TimelineThreadsWithTotalDTO, {
    deprecationReason: 'Use getTimelineThreadsFromObjectRecord instead',
  })
  async getTimelineThreadsFromPersonId(
    @AuthUser() user: AuthContextUser,
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

    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord(
      workspaceMember.id,
      CoreObjectNameSingular.Person,
      personId,
      workspace.id,
      page,
      pageSize,
    );
  }

  @Query(() => TimelineThreadsWithTotalDTO, {
    deprecationReason: 'Use getTimelineThreadsFromObjectRecord instead',
  })
  async getTimelineThreadsFromCompanyId(
    @AuthUser() user: AuthContextUser,
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

    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord(
      workspaceMember.id,
      CoreObjectNameSingular.Company,
      companyId,
      workspace.id,
      page,
      pageSize,
    );
  }

  @Query(() => TimelineThreadsWithTotalDTO, {
    deprecationReason: 'Use getTimelineThreadsFromObjectRecord instead',
  })
  async getTimelineThreadsFromOpportunityId(
    @AuthUser() user: AuthContextUser,
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

    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord(
      workspaceMember.id,
      CoreObjectNameSingular.Opportunity,
      opportunityId,
      workspace.id,
      page,
      pageSize,
    );
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @Mutation(() => Boolean)
  async dismissReconnectAccountBanner(
    @AuthUser() user: AuthContextUser,
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
