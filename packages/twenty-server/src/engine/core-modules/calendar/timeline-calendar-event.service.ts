import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import omit from 'lodash.omit';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { Any, In, type Repository } from 'typeorm';

import { CalendarChannelVisibility } from 'twenty-shared/types';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/calendar/constants/calendar.constants';
import { type TimelineCalendarEventsWithTotalDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-events-with-total.dto';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async getCalendarEventsFromPersonIds({
    currentWorkspaceMemberId,
    personIds,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    personIds: string[];
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const offset = (page - 1) * pageSize;

        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
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

        const [events, total] = await calendarEventRepository.findAndCount({
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

        // Resolve current user's userWorkspaceId (workspaceMember → userId → userWorkspace)
        const workspaceMemberRepo =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const currentMember = await workspaceMemberRepo.findOne({
          where: { id: currentWorkspaceMemberId },
          select: { userId: true },
        });

        const currentUserWorkspaceId = currentMember
          ? ((
              await this.userWorkspaceRepository.findOne({
                where: { userId: currentMember.userId, workspaceId },
                select: { id: true },
              })
            )?.id ?? null)
          : null;

        // Find which connected accounts the current user owns (1 query)
        const connectedAccountIds = [
          ...new Set(
            calendarChannels.map((channel) => channel.connectedAccountId),
          ),
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
              isOwnedByCurrentUser: ownedAccountIds.has(
                channel.connectedAccountId,
              ),
            },
          ]),
        );

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
              handle: participant.handle ?? '',
            }),
          );

          const hasFullAccess = event.calendarChannelEventAssociations.some(
            (association) => {
              const channel = calendarChannelMap.get(
                association.calendarChannelId,
              );

              return (
                channel?.visibility === 'SHARE_EVERYTHING' ||
                channel?.isOwnedByCurrentUser
              );
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
            visibility,
            location: event.location ?? '',
            conferenceSolution: event.conferenceSolution ?? '',
          };
        });

        return {
          totalNumberOfCalendarEvents: total,
          timelineCalendarEvents,
        };
      },
      authContext,
    );
  }

  async getCalendarEventsFromCompanyId({
    currentWorkspaceMemberId,
    companyId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    companyId: string;
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
            { shouldBypassPermissionChecks: true },
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

        const calendarEvents = await this.getCalendarEventsFromPersonIds({
          currentWorkspaceMemberId,
          personIds: formattedPersonIds,
          workspaceId,
          page,
          pageSize,
        });

        return calendarEvents;
      },
      authContext,
    );
  }

  async getCalendarEventsFromOpportunityId({
    currentWorkspaceMemberId,
    opportunityId,
    workspaceId,
    page = 1,
    pageSize = TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  }: {
    currentWorkspaceMemberId: string;
    opportunityId: string;
    workspaceId: string;
    page: number;
    pageSize: number;
  }): Promise<TimelineCalendarEventsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const opportunityRepository =
          await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
            workspaceId,
            'opportunity',
            { shouldBypassPermissionChecks: true },
          );

        const opportunity = await opportunityRepository.findOne({
          where: {
            id: opportunityId,
          },
          select: {
            companyId: true,
          },
        });

        if (!opportunity?.companyId) {
          return {
            totalNumberOfCalendarEvents: 0,
            timelineCalendarEvents: [],
          };
        }

        const calendarEvents = await this.getCalendarEventsFromCompanyId({
          currentWorkspaceMemberId,
          companyId: opportunity.companyId,
          workspaceId,
          page,
          pageSize,
        });

        return calendarEvents;
      },
      authContext,
    );
  }
}
