import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  ArgsType,
  Field,
  ID,
  Int,
  Resolver,
} from '@nestjs/graphql';

import { Max } from 'class-validator';

import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventsWithTotal } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { NotFoundError } from 'src/engine/utils/graphql-errors.util';

@ArgsType()
class GetTimelineCalendarEventsFromPersonIdArgs {
  @Field(() => ID)
  personId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_CALENDAR_EVENTS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineCalendarEventsFromCompanyIdArgs {
  @Field(() => ID)
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
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args()
    { personId, page, pageSize }: GetTimelineCalendarEventsFromPersonIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (!workspaceMember) {
      throw new NotFoundError('Workspace member not found');
    }

    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromPersonIds(
        workspaceMember.id,
        workspaceId,
        [personId],
        page,
        pageSize,
      );

    return timelineCalendarEvents;
  }

  @Query(() => TimelineCalendarEventsWithTotal)
  async getTimelineCalendarEventsFromCompanyId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args()
    { companyId, page, pageSize }: GetTimelineCalendarEventsFromCompanyIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (!workspaceMember) {
      throw new NotFoundError('Workspace member not found');
    }

    const timelineCalendarEvents =
      await this.timelineCalendarEventService.getCalendarEventsFromCompanyId(
        workspaceMember.id,
        workspaceId,
        companyId,
        page,
        pageSize,
      );

    return timelineCalendarEvents;
  }
}
