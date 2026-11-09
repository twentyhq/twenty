import { UseGuards, UseFilters } from '@nestjs/common';
import { Args, ArgsType, Field, Int, Mutation, Query } from '@nestjs/graphql';

import { Max, MaxLength } from 'class-validator';
import { PermissionFlagType } from 'twenty-shared/constants';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  TIMELINE_THREADS_MAX_PAGE_SIZE,
  TIMELINE_THREADS_SEARCH_INPUT_MAX_LENGTH,
} from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { DismissReconnectAccountBannerInput } from 'src/engine/core-modules/messaging/dtos/dismiss-reconnect-account-banner.input';
import { TimelineThreadChannelDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-channel.dto';
import { TimelineThreadSearchResultDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-search-result.dto';
import { TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const TIMELINE_MESSAGING_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [],
};

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
class GetMessageThreadChannelArgs {
  @Field(() => UUIDScalarType)
  messageThreadId: string;
}

@ArgsType()
class SearchTimelineThreadsArgs {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => UUIDScalarType)
  recordId: string;

  @Field(() => String, { nullable: true })
  @MaxLength(TIMELINE_THREADS_SEARCH_INPUT_MAX_LENGTH)
  searchInput?: string;
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

@CoreResolver(() => TimelineThreadsWithTotalDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class TimelineMessagingResolver {
  constructor(
    private readonly getMessagesFromPersonIdsService: GetMessagesService,
    private readonly timelineMessagingService: TimelineMessagingService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  @Query(() => TimelineThreadsWithTotalDTO)
  @UseGuards(
    AccessPolicyGuard(TIMELINE_MESSAGING_READ_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async getTimelineThreadsFromObjectRecord(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args()
    {
      objectNameSingular,
      recordId,
      page,
      pageSize,
    }: GetTimelineThreadsFromObjectRecordArgs,
  ) {
    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord({
      userWorkspaceId,
      objectNameSingular,
      recordId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @Query(() => TimelineThreadChannelDTO, { nullable: true })
  @UseGuards(
    AccessPolicyGuard(TIMELINE_MESSAGING_READ_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async getMessageThreadChannel(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { messageThreadId }: GetMessageThreadChannelArgs,
  ): Promise<TimelineThreadChannelDTO | null> {
    return this.timelineMessagingService.getMessageThreadChannel({
      messageThreadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Query(() => TimelineThreadSearchResultDTO)
  @UseGuards(
    AccessPolicyGuard(TIMELINE_MESSAGING_READ_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async searchTimelineThreads(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args()
    { objectNameSingular, recordId, searchInput }: SearchTimelineThreadsArgs,
  ) {
    return this.getMessagesFromPersonIdsService.searchMessagesFromObjectRecord({
      userWorkspaceId,
      objectNameSingular,
      recordId,
      workspaceId: workspace.id,
      searchInput,
    });
  }

  @Query(() => TimelineThreadsWithTotalDTO, {
    deprecationReason: 'Use getTimelineThreadsFromObjectRecord instead',
  })
  @UseGuards(
    AccessPolicyGuard(TIMELINE_MESSAGING_READ_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async getTimelineThreadsFromPersonId(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { personId, page, pageSize }: GetTimelineThreadsFromPersonIdArgs,
  ) {
    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord({
      userWorkspaceId,
      objectNameSingular: StandardObjectNameSingular.Person,
      recordId: personId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @Query(() => TimelineThreadsWithTotalDTO, {
    deprecationReason: 'Use getTimelineThreadsFromObjectRecord instead',
  })
  @UseGuards(
    AccessPolicyGuard(TIMELINE_MESSAGING_READ_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async getTimelineThreadsFromCompanyId(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { companyId, page, pageSize }: GetTimelineThreadsFromCompanyIdArgs,
  ) {
    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord({
      userWorkspaceId,
      objectNameSingular: StandardObjectNameSingular.Company,
      recordId: companyId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @Query(() => TimelineThreadsWithTotalDTO, {
    deprecationReason: 'Use getTimelineThreadsFromObjectRecord instead',
  })
  @UseGuards(
    AccessPolicyGuard(TIMELINE_MESSAGING_READ_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async getTimelineThreadsFromOpportunityId(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args()
    { opportunityId, page, pageSize }: GetTimelineThreadsFromOpportunityIdArgs,
  ) {
    return this.getMessagesFromPersonIdsService.getMessagesFromObjectRecord({
      userWorkspaceId,
      objectNameSingular: StandardObjectNameSingular.Opportunity,
      recordId: opportunityId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: false,
        oauthClient: false,
        application: false,
      },
      requiredPermissionFlags: [PermissionFlagType.CONNECTED_ACCOUNTS],
    }),
    CustomPermissionGuard,
  )
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
