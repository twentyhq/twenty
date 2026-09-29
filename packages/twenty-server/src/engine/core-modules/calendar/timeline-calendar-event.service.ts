import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Any } from 'typeorm';

import { CalendarChannelVisibility } from 'twenty-shared/types';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { type TimelineCalendarEventsWithTotalDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly relatedPersonIdsService: RelatedPersonIdsService,
    private readonly fileUrlService: FileUrlService,
    private readonly messageCalendarTargetReadinessService: MessageCalendarTargetReadinessService,
  ) {}

  async getCalendarEventsFromPersonIds({
    personIds,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
    targetFilter,
  }: {
    personIds: string[];
    workspaceId: string;
    page: number;
    pageSize: number;
    targetFilter?: TargetFilter;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    // Runs as the caller: the existence read lists every event their role can
    // read, and record shares decide which ones show a title and description.
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const offset = (page - 1) * pageSize;

      const where = isDefined(targetFilter)
        ? {
            calendarEventTargets: {
              [targetFilter.fieldName]: targetFilter.recordId,
            },
          }
        : {
            calendarEventParticipants: {
              personId: Any(personIds),
            },
          };

      let totalNumberOfCalendarEvents: number;
      let ids: string[];

      try {
        const discoverableCalendarEventRepository =
          this.workspaceOrmManager.getRepositoryWithContextPermissions<CalendarEventWorkspaceEntity>(
            'calendarEvent',
            undefined,
            'existence',
          );

        totalNumberOfCalendarEvents =
          await discoverableCalendarEventRepository.count({ where });

        const calendarEventIds = await discoverableCalendarEventRepository.find(
          {
            where,
            select: {
              id: true,
              startsAt: true,
            },
            skip: offset,
            take: pageSize,
            order: {
              startsAt: 'DESC',
            },
          },
        );

        ids = calendarEventIds.map(({ id }) => id);
      } catch (error) {
        if (error instanceof PermissionsException) {
          return {
            totalNumberOfCalendarEvents: 0,
            timelineCalendarEvents: [],
            relatedPersonIds: personIds,
          };
        }

        throw error;
      }

      if (ids.length <= 0) {
        return {
          totalNumberOfCalendarEvents,
          timelineCalendarEvents: [],
          relatedPersonIds: personIds,
        };
      }

      // The caller discovered these events above. Their participants are read
      // without the caller's role so that a role that cannot read people still
      // gets a timeline.
      // TODO run under the caller's role once roles that cannot read person
      // degrade to a redacted timeline rather than a denied one
      // https://github.com/twentyhq/core-team-issues/issues/2777
      const calendarEventRepository =
        this.workspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
          'calendarEvent',
          { shouldBypassPermissionChecks: true },
        );

      const events = await calendarEventRepository.find({
        where: {
          id: Any(ids),
        },
        relations: {
          calendarEventParticipants: {
            person: true,
            workspaceMember: true,
          },
        },
      });

      const calendarEventContentById =
        await this.findReadableCalendarEventContentById(ids);

      const callRecordingRepository =
        this.workspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
          'callRecording',
          { shouldBypassPermissionChecks: true },
        );

      const callRecordings = await callRecordingRepository.find({
        where: {
          calendarEventId: Any(ids),
        },
        select: {
          id: true,
          status: true,
          applicationId: true,
          calendarEventId: true,
        },
      });

      const callRecordingsByCalendarEventId = callRecordings.reduce<
        Map<
          string,
          {
            id: string;
            status: CallRecordingStatus;
            applicationId: string | null;
          }[]
        >
      >((acc, callRecording) => {
        if (!isDefined(callRecording.calendarEventId)) {
          return acc;
        }

        const existing = acc.get(callRecording.calendarEventId) ?? [];

        existing.push({
          id: callRecording.id,
          status: callRecording.status,
          applicationId: callRecording.applicationId ?? null,
        });
        acc.set(callRecording.calendarEventId, existing);

        return acc;
      }, new Map());

      const orderedEvents = events.sort(
        (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
      );

      const timelineCalendarEventPromises = orderedEvents.map(async (event) => {
        const participantPromises = event.calendarEventParticipants.map(
          async (participant) => {
            const personAvatarFileUrl =
              await this.fileUrlService.signFirstFilesFieldFileUrl({
                filesFieldValue: participant.person?.avatarFile,
                workspaceId,
              });

            return {
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
                personAvatarFileUrl ||
                participant.person?.avatarUrl ||
                participant.workspaceMember?.avatarUrl ||
                '',
              handle: participant.handle ?? '',
            };
          },
        );

        const participants = await Promise.all(participantPromises);

        const content = calendarEventContentById.get(event.id);

        return {
          ...omit(event, ['calendarEventParticipants']),
          title: isDefined(content)
            ? (content.title ?? '')
            : FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
          description: isDefined(content)
            ? (content.description ?? '')
            : FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
          startsAt: event.startsAt as unknown as Date,
          endsAt: event.endsAt as unknown as Date,
          participants,
          callRecordings: callRecordingsByCalendarEventId.get(event.id) ?? [],
          visibility: isDefined(content)
            ? CalendarChannelVisibility.SHARE_EVERYTHING
            : CalendarChannelVisibility.METADATA,
          location: event.location ?? '',
          conferenceSolution: event.conferenceSolution ?? '',
        };
      });

      const timelineCalendarEvents = await Promise.all(
        timelineCalendarEventPromises,
      );

      return {
        totalNumberOfCalendarEvents,
        timelineCalendarEvents,
        relatedPersonIds: personIds,
      };
    });
  }

  // A role that cannot read titles or descriptions sees every event as
  // unshared.
  private async findReadableCalendarEventContentById(
    calendarEventIds: string[],
  ): Promise<
    Map<string, Pick<CalendarEventWorkspaceEntity, 'title' | 'description'>>
  > {
    try {
      const calendarEvents = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions<CalendarEventWorkspaceEntity>(
          'calendarEvent',
        )
        .find({
          where: { id: Any(calendarEventIds) },
          select: { id: true, title: true, description: true },
        });

      return new Map(
        calendarEvents.map((calendarEvent) => [
          calendarEvent.id,
          calendarEvent,
        ]),
      );
    } catch (error) {
      if (error instanceof PermissionsException) {
        return new Map();
      }

      throw error;
    }
  }

  async getCalendarEventsFromObjectRecord({
    objectNameSingular,
    recordId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const personIds = await this.relatedPersonIdsService.getRelatedPersonIds({
      workspaceId,
      objectNameSingular,
      recordId,
    });
    const targetFilter =
      await this.messageCalendarTargetReadinessService.resolveTargetFilter({
        objectNameSingular,
        recordId,
        workspaceId,
      });

    if (!isDefined(targetFilter) && personIds.length === 0) {
      return {
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
        relatedPersonIds: [],
      };
    }

    return this.getCalendarEventsFromPersonIds({
      personIds,
      workspaceId,
      page,
      pageSize,
      ...(isDefined(targetFilter) && { targetFilter }),
    });
  }
}
