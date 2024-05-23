import { UseGuards } from '@nestjs/common';
import { Query, Args, ArgsType, Field, Int, Resolver } from '@nestjs/graphql';

import { Max } from 'class-validator';

import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventsWithTotal } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

@UseGuards(JwtAuthGuard)
@Resolver(() => TimelineCalendarEventsWithTotal)
export class TimelineCalendarEventResolver {
  constructor(
    private readonly timelineCalendarEventService: TimelineCalendarEventService,
    private readonly userService: UserService,
  ) {}

  @Query(() => TimelineCalendarEventsWithTotal)
  async getTimelineCalendarEventsFromPersonId(
    @AuthUser() user: User,
    @Args()
    { personId, page, pageSize }: GetTimelineCalendarEventsFromPersonIdArgs,
  ) {
    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromPersonIds(
        [personId],
        page,
        pageSize,
      );

    return timelineCalendarEvents;
  }

  @Query(() => TimelineCalendarEventsWithTotal)
  async getTimelineCalendarEventsFromCompanyId(
    @AuthUser() user: User,
    @Args()
    { companyId, page, pageSize }: GetTimelineCalendarEventsFromCompanyIdArgs,
  ) {
    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromCompanyId(
        companyId,
        page,
        pageSize,
      );

    return timelineCalendarEvents;
  }
}
