import { UseGuards, UseFilters } from '@nestjs/common';
import { Args, ArgsType, Field, Int, Query } from '@nestjs/graphql';

import { Max, MaxLength } from 'class-validator';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE,
  TIMELINE_CALENDAR_EVENTS_SEARCH_INPUT_MAX_LENGTH,
} from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventSearchResultDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-search-result.dto';
import { TimelineCalendarEventsWithTotalDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@ArgsType()
class GetTimelineCalendarEventsFromObjectRecordArgs {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => UUIDScalarType)
  recordId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class SearchTimelineCalendarEventsArgs {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => UUIDScalarType)
  recordId: string;

  @Field(() => String, { nullable: true })
  @MaxLength(TIMELINE_CALENDAR_EVENTS_SEARCH_INPUT_MAX_LENGTH)
  searchInput?: string;
}

@ArgsType()
class GetTimelineCalendarEventsFromPersonIdArgs {
  @Field(() => UUIDScalarType)
  personId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineCalendarEventsFromCompanyIdArgs {
  @Field(() => UUIDScalarType)
  companyId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineCalendarEventsFromOpportunityIdArgs {
  @Field(() => UUIDScalarType)
  opportunityId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE)
  pageSize: number;
}

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  CustomPermissionGuard,
)
@CoreResolver(() => TimelineCalendarEventsWithTotalDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class TimelineCalendarEventResolver {
  constructor(
    private readonly timelineCalendarEventService: TimelineCalendarEventService,
  ) {}

  @Query(() => TimelineCalendarEventsWithTotalDTO)
  async getTimelineCalendarEventsFromObjectRecord(
    @Args()
    {
      objectNameSingular,
      recordId,
      page,
      pageSize,
    }: GetTimelineCalendarEventsFromObjectRecordArgs,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.timelineCalendarEventService.getCalendarEventsFromObjectRecord({
      userWorkspaceId,
      objectNameSingular,
      recordId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @Query(() => TimelineCalendarEventSearchResultDTO)
  async searchTimelineCalendarEvents(
    @Args()
    {
      objectNameSingular,
      recordId,
      searchInput,
    }: SearchTimelineCalendarEventsArgs,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.timelineCalendarEventService.searchCalendarEventsFromObjectRecord(
      {
        userWorkspaceId,
        objectNameSingular,
        recordId,
        workspaceId: workspace.id,
        searchInput,
      },
    );
  }

  @Query(() => TimelineCalendarEventsWithTotalDTO, {
    deprecationReason: 'Use getTimelineCalendarEventsFromObjectRecord instead',
  })
  async getTimelineCalendarEventsFromPersonId(
    @Args()
    { personId, page, pageSize }: GetTimelineCalendarEventsFromPersonIdArgs,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.timelineCalendarEventService.getCalendarEventsFromObjectRecord({
      userWorkspaceId,
      objectNameSingular: CoreObjectNameSingular.Person,
      recordId: personId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @Query(() => TimelineCalendarEventsWithTotalDTO, {
    deprecationReason: 'Use getTimelineCalendarEventsFromObjectRecord instead',
  })
  async getTimelineCalendarEventsFromCompanyId(
    @Args()
    { companyId, page, pageSize }: GetTimelineCalendarEventsFromCompanyIdArgs,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.timelineCalendarEventService.getCalendarEventsFromObjectRecord({
      userWorkspaceId,
      objectNameSingular: CoreObjectNameSingular.Company,
      recordId: companyId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }

  @Query(() => TimelineCalendarEventsWithTotalDTO, {
    deprecationReason: 'Use getTimelineCalendarEventsFromObjectRecord instead',
  })
  async getTimelineCalendarEventsFromOpportunityId(
    @Args()
    {
      opportunityId,
      page,
      pageSize,
    }: GetTimelineCalendarEventsFromOpportunityIdArgs,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.timelineCalendarEventService.getCalendarEventsFromObjectRecord({
      userWorkspaceId,
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      recordId: opportunityId,
      workspaceId: workspace.id,
      page,
      pageSize,
    });
  }
}
