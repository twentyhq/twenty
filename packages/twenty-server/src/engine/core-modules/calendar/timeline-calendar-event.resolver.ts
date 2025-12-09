import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Field, Int, Query, Resolver } from '@nestjs/graphql';

import { Max } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventsWithTotalDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

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

@UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
@Resolver(() => TimelineCalendarEventsWithTotalDTO)
export class TimelineCalendarEventResolver {
  constructor(
    private readonly timelineCalendarEventService: TimelineCalendarEventService,
  ) {}

  @Query(() => TimelineCalendarEventsWithTotalDTO)
  async getTimelineCalendarEventsFromPersonId(
    @Args()
    { personId, page, pageSize }: GetTimelineCalendarEventsFromPersonIdArgs,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromPersonIds({
        currentWorkspaceMemberId: workspaceMemberId,
        personIds: [personId],
        workspaceId: workspace.id,
        page,
        pageSize,
      });

    return timelineCalendarEvents;
  }

  @Query(() => TimelineCalendarEventsWithTotalDTO)
  async getTimelineCalendarEventsFromCompanyId(
    @Args()
    { companyId, page, pageSize }: GetTimelineCalendarEventsFromCompanyIdArgs,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromCompanyId({
        currentWorkspaceMemberId: workspaceMemberId,
        companyId,
        workspaceId: workspace.id,
        page,
        pageSize,
      });

    return timelineCalendarEvents;
  }

  @Query(() => TimelineCalendarEventsWithTotalDTO)
  async getTimelineCalendarEventsFromOpportunityId(
    @Args()
    {
      opportunityId,
      page,
      pageSize,
    }: GetTimelineCalendarEventsFromOpportunityIdArgs,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromOpportunityId(
        {
          currentWorkspaceMemberId: workspaceMemberId,
          opportunityId,
          workspaceId: workspace.id,
          page,
          pageSize,
        },
      );

    return timelineCalendarEvents;
  }
}
