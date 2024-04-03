import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';

import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventAttendee } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-attendee.dto';
import {
  TimelineCalendarEvent,
  TimelineCalendarEventVisibility,
} from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';
import { TimelineCalendarEventsWithTotal } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarEventAttendeeObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-attendee.object-metadata';

type TimelineCalendarEventAttendeeWithPersonInformation =
  ObjectRecord<CalendarEventAttendeeObjectMetadata> & {
    personFirstName: string;
    personLastName: string;
    personAvatarUrl: string;
    workspaceMemberFirstName: string;
    workspaceMemberLastName: string;
    workspaceMemberAvatarUrl: string;
  };
@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async getCalendarEventsFromPersonIds(
    workspaceMemberId: string,
    workspaceId: string,
    personIds: string[],
    page: number = 1,
    pageSize: number = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineCalendarEventsWithTotal> {
    const offset = (page - 1) * pageSize;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEvents: Omit<TimelineCalendarEvent, 'attendees'>[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
            "calendarEvent".*
        FROM
            ${dataSourceSchema}."calendarEvent" "calendarEvent"
        LEFT JOIN
            ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee" ON "calendarEvent".id = "calendarEventAttendee"."calendarEventId"
        LEFT JOIN
            ${dataSourceSchema}."person" "person" ON "calendarEventAttendee"."personId" = "person".id
        WHERE
            "calendarEventAttendee"."personId" = ANY($1)
        GROUP BY
            "calendarEvent".id
        ORDER BY
            "calendarEvent"."startsAt" DESC
        LIMIT $2
        OFFSET $3`,
        [personIds, pageSize, offset],
        workspaceId,
      );

    if (!calendarEvents) {
      return {
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
      };
    }

    const calendarEventAttendees: TimelineCalendarEventAttendeeWithPersonInformation[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
            "calendarEventAttendee".*,
            "person"."nameFirstName" as "personFirstName",
            "person"."nameLastName" as "personLastName",
            "person"."avatarUrl" as "personAvatarUrl",
            "workspaceMember"."nameFirstName" as "workspaceMemberFirstName",
            "workspaceMember"."nameLastName" as "workspaceMemberLastName",
            "workspaceMember"."avatarUrl" as "workspaceMemberAvatarUrl"
        FROM
            ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
        LEFT JOIN
            ${dataSourceSchema}."person" "person" ON "calendarEventAttendee"."personId" = "person".id
        LEFT JOIN
            ${dataSourceSchema}."workspaceMember" "workspaceMember" ON "calendarEventAttendee"."workspaceMemberId" = "workspaceMember".id
        WHERE
            "calendarEventAttendee"."calendarEventId" = ANY($1)`,
        [calendarEvents.map((event) => event.id)],
        workspaceId,
      );

    const formattedCalendarEventAttendees: TimelineCalendarEventAttendee[] =
      calendarEventAttendees.map((attendee) => {
        const firstName =
          attendee.personFirstName || attendee.workspaceMemberFirstName || '';

        const lastName =
          attendee.personLastName || attendee.workspaceMemberLastName || '';

        const displayName =
          firstName || attendee.displayName || attendee.handle;

        const avatarUrl =
          attendee.personAvatarUrl || attendee.workspaceMemberAvatarUrl || '';

        return {
          calendarEventId: attendee.calendarEventId,
          personId: attendee.personId,
          workspaceMemberId: attendee.workspaceMemberId,
          firstName,
          lastName,
          displayName,
          avatarUrl,
          handle: attendee.handle,
        };
      });

    const calendarEventAttendeesByEventId: {
      [calendarEventId: string]: TimelineCalendarEventAttendee[];
    } = groupBy(formattedCalendarEventAttendees, 'calendarEventId');

    const totalNumberOfCalendarEvents: { count: number }[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT
          COUNT(DISTINCT "calendarEventId")
      FROM
          ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
      WHERE
          "calendarEventAttendee"."personId" = ANY($1)
      `,
        [personIds],
        workspaceId,
      );

    const timelineCalendarEvents = calendarEvents.map((event) => {
      const attendees = calendarEventAttendeesByEventId[event.id] || [];

      return {
        ...event,
        attendees,
      };
    });

    const calendarEventIdsWithWorkspaceMemberInAttendees =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT
          "calendarEventId"
      FROM
          ${dataSourceSchema}."calendarEventAttendee" "calendarEventAttendee"
      WHERE
          "calendarEventAttendee"."workspaceMemberId" = $1
      `,
        [workspaceMemberId],
        workspaceId,
      );

    const calendarEventIdsWithWorkspaceMemberInAttendeesFormatted =
      calendarEventIdsWithWorkspaceMemberInAttendees.map(
        (event: { calendarEventId: string }) => event.calendarEventId,
      );

    const calendarEventIdsToFetchVisibilityFor = timelineCalendarEvents
      .filter(
        (event) =>
          !calendarEventIdsWithWorkspaceMemberInAttendeesFormatted.includes(
            event.id,
          ),
      )
      .map((event) => event.id);

    const calendarEventIdsForWhichVisibilityIsMetadata:
      | {
          id: string;
        }[]
      | undefined = await this.workspaceDataSourceService.executeRawQuery(
      `
      SELECT
          "calendarChannelEventAssociation"."calendarEventId" AS "id"
      FROM
          ${dataSourceSchema}."calendarChannel" "calendarChannel"
      LEFT JOIN
          ${dataSourceSchema}."calendarChannelEventAssociation" "calendarChannelEventAssociation" ON "calendarChannel".id = "calendarChannelEventAssociation"."calendarChannelId"
      WHERE
          "calendarChannelEventAssociation"."calendarEventId" = ANY($1)
      AND
          "calendarChannel"."visibility" = 'METADATA'
      `,
      [calendarEventIdsToFetchVisibilityFor],
      workspaceId,
    );

    if (!calendarEventIdsForWhichVisibilityIsMetadata) {
      throw new Error('Failed to fetch calendar event visibility');
    }

    const calendarEventIdsForWhichVisibilityIsMetadataMap = new Map(
      calendarEventIdsForWhichVisibilityIsMetadata.map((event) => [
        event.id,
        TimelineCalendarEventVisibility.METADATA,
      ]),
    );

    timelineCalendarEvents.forEach((event) => {
      event.visibility =
        calendarEventIdsForWhichVisibilityIsMetadataMap.get(event.id) ??
        TimelineCalendarEventVisibility.SHARE_EVERYTHING;

      if (event.visibility === TimelineCalendarEventVisibility.METADATA) {
        event.title = '';
        event.description = '';
        event.location = '';
        event.conferenceSolution = '';
        event.conferenceLink = { label: '', url: '' };
      }
    });

    return {
      totalNumberOfCalendarEvents: totalNumberOfCalendarEvents[0].count,
      timelineCalendarEvents,
    };
  }

  async getCalendarEventsFromCompanyId(
    workspaceMemberId: string,
    workspaceId: string,
    companyId: string,
    page: number = 1,
    pageSize: number = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineCalendarEventsWithTotal> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const personIds = await this.workspaceDataSourceService.executeRawQuery(
      `
        SELECT 
            p."id"
        FROM
            ${dataSourceSchema}."person" p
        WHERE
            p."companyId" = $1
        `,
      [companyId],
      workspaceId,
    );

    if (!personIds) {
      return {
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
      };
    }

    const formattedPersonIds = personIds.map(
      (personId: { id: string }) => personId.id,
    );

    const messageThreads = await this.getCalendarEventsFromPersonIds(
      workspaceMemberId,
      workspaceId,
      formattedPersonIds,
      page,
      pageSize,
    );

    return messageThreads;
  }
}
