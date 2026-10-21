import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import omit from 'lodash.omit';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isNonEmptyString } from '@sniptt/guards';
import { escapeForIlike, isDefined } from 'twenty-shared/utils';
import { Any, In, type Repository } from 'typeorm';

import { CalendarChannelVisibility } from 'twenty-shared/types';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { type TimelineCalendarEventSearchResultDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-search-result.dto';
import { type TimelineCalendarEventDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';
import { type TimelineCalendarEventsWithTotalDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { isCalendarChannelFullyVisible } from 'src/engine/core-modules/calendar/utils/is-calendar-channel-fully-visible.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { type TargetFilter } from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly relatedPersonIdsService: RelatedPersonIdsService,
    private readonly fileUrlService: FileUrlService,
    private readonly messageCalendarTargetReadinessService: MessageCalendarTargetReadinessService,
  ) {}

  async getCalendarEventsFromPersonIds({
    currentWorkspaceMemberId,
    personIds,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
    targetFilter,
  }: {
    currentWorkspaceMemberId: string;
    personIds: string[];
    workspaceId: string;
    page: number;
    pageSize: number;
    targetFilter?: TargetFilter;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const offset = (page - 1) * pageSize;

      // System auth context resolves no role, so participant relations would be denied; channel-level redaction below gates access.
      // TODO: run under the caller's role once unreadable person degrades to redaction https://github.com/twentyhq/core-team-issues/issues/2777
      const calendarEventRepository =
        this.workspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
          'calendarEvent',
          { shouldBypassPermissionChecks: true },
        );

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

      const totalNumberOfCalendarEvents = await calendarEventRepository.count({
        where,
      });

      const calendarEventIds = await calendarEventRepository.find({
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
      });

      const ids = calendarEventIds.map(({ id }) => id);

      if (ids.length <= 0) {
        return {
          totalNumberOfCalendarEvents,
          timelineCalendarEvents: [],
          relatedPersonIds: personIds,
        };
      }

      return {
        totalNumberOfCalendarEvents,
        timelineCalendarEvents: await this.formatTimelineCalendarEvents({
          calendarEventIds: ids,
          currentWorkspaceMemberId,
          workspaceId,
        }),
        relatedPersonIds: personIds,
      };
    }, authContext);
  }

  async getCalendarEventsFromObjectRecord({
    currentWorkspaceMemberId,
    objectNameSingular,
    recordId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
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
      currentWorkspaceMemberId,
      personIds,
      workspaceId,
      page,
      pageSize,
      ...(isDefined(targetFilter) && { targetFilter }),
    });
  }

  async searchCalendarEventsFromObjectRecord({
    currentWorkspaceMemberId,
    objectNameSingular,
    recordId,
    workspaceId,
    searchInput,
    limit = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
    searchInput?: string;
    limit?: number;
  }): Promise<TimelineCalendarEventSearchResultDTO> {
    if (!isNonEmptyString(searchInput?.trim())) {
      const { timelineCalendarEvents } =
        await this.getCalendarEventsFromObjectRecord({
          currentWorkspaceMemberId,
          objectNameSingular,
          recordId,
          workspaceId,
          page: 1,
          pageSize: limit,
        });

      return {
        recordTimelineCalendarEvents: timelineCalendarEvents,
        otherTimelineCalendarEvents: [],
      };
    }

    const [personIds, targetFilter] = await Promise.all([
      this.relatedPersonIdsService.getRelatedPersonIds({
        workspaceId,
        objectNameSingular,
        recordId,
      }),
      this.messageCalendarTargetReadinessService.resolveTargetFilter({
        objectNameSingular,
        recordId,
        workspaceId,
      }),
    ]);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const { ownedCalendarChannelIds, titleVisibleCalendarChannelIds } =
        await this.getSearchableCalendarChannelIds({
          currentWorkspaceMemberId,
          workspaceId,
        });

      // Only channels sharing everything are searched, so a match never reveals a hidden title
      const recordCalendarEventIds = await this.searchCalendarEventIds({
        searchInput,
        calendarChannelIds: titleVisibleCalendarChannelIds,
        recordFilter: { targetFilter, personIds },
        limit,
      });

      // The fallback searches only the viewer's own calendars, as nothing else narrows it down
      const otherCalendarEventIds = await this.searchCalendarEventIds({
        searchInput,
        calendarChannelIds: ownedCalendarChannelIds,
        excludedCalendarEventIds: recordCalendarEventIds,
        limit,
      });

      const [recordTimelineCalendarEvents, otherTimelineCalendarEvents] =
        await Promise.all([
          this.formatTimelineCalendarEvents({
            calendarEventIds: recordCalendarEventIds,
            currentWorkspaceMemberId,
            workspaceId,
          }),
          this.formatTimelineCalendarEvents({
            calendarEventIds: otherCalendarEventIds,
            currentWorkspaceMemberId,
            workspaceId,
          }),
        ]);

      return { recordTimelineCalendarEvents, otherTimelineCalendarEvents };
    }, buildSystemAuthContext(workspaceId));
  }

  private async searchCalendarEventIds({
    searchInput,
    calendarChannelIds,
    recordFilter,
    excludedCalendarEventIds = [],
    limit,
  }: {
    searchInput: string;
    calendarChannelIds: string[];
    recordFilter?: { targetFilter?: TargetFilter; personIds: string[] };
    excludedCalendarEventIds?: string[];
    limit: number;
  }): Promise<string[]> {
    const searchWords = searchInput
      .trim()
      .split(/\s+/)
      .filter(isNonEmptyString);

    if (searchWords.length === 0 || calendarChannelIds.length === 0) {
      return [];
    }

    if (
      isDefined(recordFilter) &&
      !isDefined(recordFilter.targetFilter) &&
      recordFilter.personIds.length === 0
    ) {
      return [];
    }

    const calendarEventRepository =
      this.workspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
        'calendarEvent',
        { shouldBypassPermissionChecks: true },
      );

    const queryBuilder = calendarEventRepository
      .createQueryBuilder('calendarEvent')
      .select('calendarEvent.id', 'id')
      .addSelect('calendarEvent.startsAt', 'startsAt')
      .innerJoin(
        'calendarEvent.calendarChannelEventAssociations',
        'calendarChannelEventAssociations',
      )
      .where(
        'calendarChannelEventAssociations.calendarChannelId IN (:...calendarChannelIds)',
        { calendarChannelIds },
      );

    searchWords.forEach((searchWord, index) => {
      const parameterName = `searchWord${index}`;

      queryBuilder.andWhere(`calendarEvent.title ILIKE :${parameterName}`, {
        [parameterName]: `%${escapeForIlike(searchWord)}%`,
      });
    });

    if (isDefined(recordFilter?.targetFilter)) {
      queryBuilder
        .innerJoin('calendarEvent.calendarEventTargets', 'calendarEventTargets')
        .andWhere(
          `calendarEventTargets.${recordFilter.targetFilter.fieldName} = :targetRecordId`,
          { targetRecordId: recordFilter.targetFilter.recordId },
        );
    } else if (isDefined(recordFilter)) {
      queryBuilder
        .innerJoin(
          'calendarEvent.calendarEventParticipants',
          'calendarEventParticipants',
        )
        .andWhere('calendarEventParticipants.personId IN (:...personIds)', {
          personIds: recordFilter.personIds,
        });
    }

    if (excludedCalendarEventIds.length > 0) {
      queryBuilder.andWhere(
        'calendarEvent.id NOT IN (:...excludedCalendarEventIds)',
        { excludedCalendarEventIds },
      );
    }

    const calendarEvents = await queryBuilder
      .groupBy('calendarEvent.id')
      .addGroupBy('calendarEvent.startsAt')
      .orderBy('calendarEvent.startsAt', 'DESC')
      .limit(limit)
      .getRawMany<{ id: string }>();

    return calendarEvents.map(({ id }) => id);
  }

  private async getSearchableCalendarChannelIds({
    currentWorkspaceMemberId,
    workspaceId,
  }: {
    currentWorkspaceMemberId: string;
    workspaceId: string;
  }): Promise<{
    ownedCalendarChannelIds: string[];
    titleVisibleCalendarChannelIds: string[];
  }> {
    const currentUserWorkspaceId = await this.getCurrentUserWorkspaceId({
      currentWorkspaceMemberId,
      workspaceId,
    });

    const [ownedConnectedAccounts, calendarChannels] = await Promise.all([
      isDefined(currentUserWorkspaceId)
        ? this.connectedAccountRepository.find({
            where: { userWorkspaceId: currentUserWorkspaceId, workspaceId },
            select: { id: true },
          })
        : [],
      this.calendarChannelRepository.find({
        where: { workspaceId },
        select: { id: true, visibility: true, connectedAccountId: true },
      }),
    ]);

    const ownedConnectedAccountIds = new Set(
      ownedConnectedAccounts.map((connectedAccount) => connectedAccount.id),
    );

    const ownedCalendarChannelIds: string[] = [];
    const titleVisibleCalendarChannelIds: string[] = [];

    for (const calendarChannel of calendarChannels) {
      const isOwnedByCurrentUser = ownedConnectedAccountIds.has(
        calendarChannel.connectedAccountId,
      );

      if (isOwnedByCurrentUser) {
        ownedCalendarChannelIds.push(calendarChannel.id);
      }

      if (
        isCalendarChannelFullyVisible({
          visibility: calendarChannel.visibility,
          isOwnedByCurrentUser,
        })
      ) {
        titleVisibleCalendarChannelIds.push(calendarChannel.id);
      }
    }

    return { ownedCalendarChannelIds, titleVisibleCalendarChannelIds };
  }

  private async formatTimelineCalendarEvents({
    calendarEventIds: ids,
    currentWorkspaceMemberId,
    workspaceId,
  }: {
    calendarEventIds: string[];
    currentWorkspaceMemberId: string;
    workspaceId: string;
  }): Promise<TimelineCalendarEventDTO[]> {
    if (ids.length === 0) {
      return [];
    }

    const calendarEventRepository =
      this.workspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
        'calendarEvent',
        { shouldBypassPermissionChecks: true },
      );

    const [events] = await calendarEventRepository.findAndCount({
      where: {
        id: Any(ids),
      },
      relations: {
        calendarEventParticipants: {
          person: true,
          workspaceMember: true,
        },
        calendarChannelEventAssociations: true,
      },
    });

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

    const allCalendarChannelIds = [
      ...new Set(
        events.flatMap((event) =>
          event.calendarChannelEventAssociations.map(
            (association) => association.calendarChannelId,
          ),
        ),
      ),
    ];

    const calendarChannels =
      allCalendarChannelIds.length > 0
        ? await this.calendarChannelRepository.find({
            where: { id: In(allCalendarChannelIds), workspaceId },
          })
        : [];

    const currentUserWorkspaceId = await this.getCurrentUserWorkspaceId({
      currentWorkspaceMemberId,
      workspaceId,
    });

    const connectedAccountIds = [
      ...new Set(calendarChannels.map((channel) => channel.connectedAccountId)),
    ];

    const ownedAccountIds =
      connectedAccountIds.length > 0 && currentUserWorkspaceId
        ? new Set(
            (
              await this.connectedAccountRepository.find({
                where: {
                  id: In(connectedAccountIds),
                  userWorkspaceId: currentUserWorkspaceId,
                },
                select: { id: true },
              })
            ).map((a) => a.id),
          )
        : new Set<string>();

    const calendarChannelMap = new Map(
      calendarChannels.map((channel) => [
        channel.id,
        {
          visibility: channel.visibility,
          isOwnedByCurrentUser: ownedAccountIds.has(channel.connectedAccountId),
        },
      ]),
    );

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

      const hasFullAccess = event.calendarChannelEventAssociations.some(
        (association) => {
          const channel = calendarChannelMap.get(association.calendarChannelId);

          return isDefined(channel) && isCalendarChannelFullyVisible(channel);
        },
      );

      const visibility = hasFullAccess
        ? CalendarChannelVisibility.SHARE_EVERYTHING
        : CalendarChannelVisibility.METADATA;

      return {
        ...omit(event, [
          'calendarEventParticipants',
          'calendarChannelEventAssociations',
        ]),
        title:
          visibility === CalendarChannelVisibility.METADATA
            ? FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
            : (event.title ?? ''),
        description:
          visibility === CalendarChannelVisibility.METADATA
            ? FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
            : (event.description ?? ''),
        startsAt: event.startsAt as unknown as Date,
        endsAt: event.endsAt as unknown as Date,
        participants,
        callRecordings: callRecordingsByCalendarEventId.get(event.id) ?? [],
        visibility,
        location: event.location ?? '',
        conferenceSolution: event.conferenceSolution ?? '',
      };
    });

    return Promise.all(timelineCalendarEventPromises);
  }

  private async getCurrentUserWorkspaceId({
    currentWorkspaceMemberId,
    workspaceId,
  }: {
    currentWorkspaceMemberId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const workspaceMemberRepository =
      this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const currentMember = await workspaceMemberRepository.findOne({
      where: { id: currentWorkspaceMemberId },
      select: { userId: true },
    });

    if (!isDefined(currentMember)) {
      return null;
    }

    const currentUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: currentMember.userId, workspaceId },
      select: { id: true },
    });

    return currentUserWorkspace?.id ?? null;
  }
}
