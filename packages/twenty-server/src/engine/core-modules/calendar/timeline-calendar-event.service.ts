import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';

import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { TimelineCalendarEventParticipant } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-participant.dto';
import {
  TimelineCalendarEvent,
  TimelineCalendarEventVisibility,
} from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';
import { TimelineCalendarEventsWithTotal } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';

type TimelineCalendarEventParticipantWithPersonInformation =
  ObjectRecord<CalendarEventParticipantObjectMetadata> & {
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

    const calendarEvents: Omit<TimelineCalendarEvent, 'participants'>[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
            "calendarEvent".*
        FROM
            ${dataSourceSchema}."calendarEvent" "calendarEvent"
        LEFT JOIN
            ${dataSourceSchema}."calendarEventParticipant" "calendarEventParticipant" ON "calendarEvent".id = "calendarEventParticipant"."calendarEventId"
        LEFT JOIN
            ${dataSourceSchema}."person" "person" ON "calendarEventParticipant"."personId" = "person".id
        WHERE
            "calendarEventParticipant"."personId" = ANY($1)
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

    const calendarEventParticipants: TimelineCalendarEventParticipantWithPersonInformation[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT
            "calendarEventParticipant".*,
            "person"."nameFirstName" as "personFirstName",
            "person"."nameLastName" as "personLastName",
            "person"."avatarUrl" as "personAvatarUrl",
            "workspaceMember"."nameFirstName" as "workspaceMemberFirstName",
            "workspaceMember"."nameLastName" as "workspaceMemberLastName",
            "workspaceMember"."avatarUrl" as "workspaceMemberAvatarUrl"
        FROM
            ${dataSourceSchema}."calendarEventParticipant" "calendarEventParticipant"
        LEFT JOIN
            ${dataSourceSchema}."person" "person" ON "calendarEventParticipant"."personId" = "person".id
        LEFT JOIN
            ${dataSourceSchema}."workspaceMember" "workspaceMember" ON "calendarEventParticipant"."workspaceMemberId" = "workspaceMember".id
        WHERE
            "calendarEventParticipant"."calendarEventId" = ANY($1)`,
        [calendarEvents.map((event) => event.id)],
        workspaceId,
      );

    const formattedCalendarEventParticipants: TimelineCalendarEventParticipant[] =
      calendarEventParticipants.map((participant) => {
        const firstName =
          participant.personFirstName ||
          participant.workspaceMemberFirstName ||
          '';

        const lastName =
          participant.personLastName ||
          participant.workspaceMemberLastName ||
          '';

        const displayName =
          firstName || participant.displayName || participant.handle;

        const avatarUrl =
          participant.personAvatarUrl ||
          participant.workspaceMemberAvatarUrl ||
          '';

        return {
          calendarEventId: participant.calendarEventId,
          personId: participant.personId,
          workspaceMemberId: participant.workspaceMemberId,
          firstName,
          lastName,
          displayName,
          avatarUrl,
          handle: participant.handle,
        };
      });

    const calendarEventParticipantsByEventId: {
      [calendarEventId: string]: TimelineCalendarEventParticipant[];
    } = groupBy(formattedCalendarEventParticipants, 'calendarEventId');

    const totalNumberOfCalendarEvents: { count: number }[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT
          COUNT(DISTINCT "calendarEventId")
      FROM
          ${dataSourceSchema}."calendarEventParticipant" "calendarEventParticipant"
      WHERE
          "calendarEventParticipant"."personId" = ANY($1)
      `,
        [personIds],
        workspaceId,
      );

    const timelineCalendarEvents = calendarEvents.map((event) => {
      const participants = calendarEventParticipantsByEventId[event.id] || [];

      return {
        ...event,
        participants,
      };
    });

    const calendarEventIdsWithWorkspaceMemberInParticipants =
      await this.workspaceDataSourceService.executeRawQuery(
        `
      SELECT
          "calendarEventId"
      FROM
          ${dataSourceSchema}."calendarEventParticipant" "calendarEventParticipant"
      WHERE
          "calendarEventParticipant"."workspaceMemberId" = $1
      `,
        [workspaceMemberId],
        workspaceId,
      );

    const calendarEventIdsWithWorkspaceMemberInParticipantsFormatted =
      calendarEventIdsWithWorkspaceMemberInParticipants.map(
        (event: { calendarEventId: string }) => event.calendarEventId,
      );

    const calendarEventIdsToFetchVisibilityFor = timelineCalendarEvents
      .filter(
        (event) =>
          !calendarEventIdsWithWorkspaceMemberInParticipantsFormatted.includes(
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
