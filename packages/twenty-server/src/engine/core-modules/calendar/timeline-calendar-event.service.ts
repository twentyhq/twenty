import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { Any } from 'typeorm';

import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventsWithTotal } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class TimelineCalendarEventService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  // TODO: Align return type with the entities to avoid mapping
  async getCalendarEventsFromPersonIds(
    personIds: string[],
    page = 1,
    pageSize: number = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineCalendarEventsWithTotal> {
    const offset = (page - 1) * pageSize;

    const calendarEventRepository =
      await this.twentyORMManager.getRepository<CalendarEventWorkspaceEntity>(
        'calendarEvent',
      );

    const calendarEventIds = await calendarEventRepository.find({
      where: {
        calendarEventParticipants: {
          personId: Any(personIds),
        },
      },
      select: {
        id: true,
        startsAt: true,
      },
      skip: offset,
      take: pageSize,
      order: {
        startsAt: 'DESC',
      },
    });

    const ids = calendarEventIds.map(({ id }) => id);

    if (ids.length <= 0) {
      return {
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
      };
    }

    // We've split the query into two parts, because we want to fetch all the participants without any filtering
    const [events, total] = await calendarEventRepository.findAndCount({
      where: {
        id: Any(ids),
      },
      relations: {
        calendarEventParticipants: {
          person: true,
          workspaceMember: true,
        },
        calendarChannelEventAssociations: {
          calendarChannel: true,
        },
      },
    });

    // Keep events in the same order as they ids were returned
    const orderedEvents = events.sort(
      (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
    );

    const timelineCalendarEvents = orderedEvents.map((event) => {
      const participants = event.calendarEventParticipants.map(
        (participant) => ({
          calendarEventId: event.id,
          personId: participant.personId ?? null,
          workspaceMemberId: participant.workspaceMemberId ?? null,
          firstName:
            participant.person?.name?.firstName ||
            participant.workspaceMember?.name.firstName ||
            '',
          lastName:
            participant.person?.name?.lastName ||
            participant.workspaceMember?.name.lastName ||
            '',
          displayName:
            participant.person?.name?.firstName ||
            participant.person?.name?.lastName ||
            participant.workspaceMember?.name.firstName ||
            participant.workspaceMember?.name.lastName ||
            participant.displayName ||
            participant.handle ||
            '',
          avatarUrl:
            participant.person?.avatarUrl ||
            participant.workspaceMember?.avatarUrl ||
            '',
          handle: participant.handle,
        }),
      );
      const visibility = event.calendarChannelEventAssociations.some(
        (association) => association.calendarChannel.visibility === 'METADATA',
      )
        ? CalendarChannelVisibility.METADATA
        : CalendarChannelVisibility.SHARE_EVERYTHING;

      return {
        ...omit(event, [
          'calendarEventParticipants',
          'calendarChannelEventAssociations',
        ]),
        startsAt: event.startsAt as unknown as Date,
        endsAt: event.endsAt as unknown as Date,
        participants,
        visibility,
      };
    });

    return {
      totalNumberOfCalendarEvents: total,
      timelineCalendarEvents,
    };
  }

  async getCalendarEventsFromCompanyId(
    companyId: string,
    page = 1,
    pageSize: number = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineCalendarEventsWithTotal> {
    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
      );

    const personIds = await personRepository.find({
      where: {
        companyId,
      },
      select: {
        id: true,
      },
    });

    if (personIds.length <= 0) {
      return {
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
      };
    }

    const formattedPersonIds = personIds.map(({ id }) => id);

    const messageThreads = await this.getCalendarEventsFromPersonIds(
      formattedPersonIds,
      page,
      pageSize,
    );

    return messageThreads;
  }
}
