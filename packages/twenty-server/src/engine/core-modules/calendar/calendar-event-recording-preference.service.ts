import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CalendarEventRecordingPreferenceDTO } from 'src/engine/core-modules/calendar/dtos/calendar-event-recording-preference.dto';
import { type CalendarEventRecordingPreference } from 'src/engine/core-modules/calendar/types/calendar-event-recording-preference.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@Injectable()
export class CalendarEventRecordingPreferenceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  async updateCalendarEventRecordingPreference({
    workspaceId,
    userWorkspaceId,
    workspaceMemberId,
    calendarEventId,
    recordingPreference,
    authContext,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    calendarEventId: string;
    recordingPreference: CalendarEventRecordingPreference;
    authContext: UserWorkspaceAuthContext;
  }): Promise<CalendarEventRecordingPreferenceDTO> {
    const canUpdateRecordingPreference =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const calendarEvent = await this.findCalendarEvent({
            calendarEventId,
            workspaceId,
          });

          if (calendarEvent === null) {
            return false;
          }

          return this.canUpdateCalendarEventRecordingPreferenceForCalendarEvent(
            {
              calendarEvent,
              userWorkspaceId,
              workspaceMemberId,
              workspaceId,
            },
          );
        },
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    if (!canUpdateRecordingPreference) {
      throw new ForbiddenError(
        'You do not have permission to update this calendar event recording preference.',
      );
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
            'calendarEvent',
          );

        const updateResult = await calendarEventRepository.update(
          calendarEventId,
          {
            recordingPreference,
          },
        );

        if ((updateResult.affected ?? 0) === 0) {
          throw new NotFoundError('Calendar event not found.');
        }
      },
      authContext,
      { lite: true },
    );

    return {
      calendarEventId,
      recordingPreference,
    };
  }

  async canUpdateCalendarEventRecordingPreference({
    workspaceId,
    userWorkspaceId,
    workspaceMemberId,
    calendarEventId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    calendarEventId: string;
  }): Promise<boolean> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarEvent = await this.findCalendarEvent({
          calendarEventId,
          workspaceId,
        });

        if (calendarEvent === null) {
          return false;
        }

        return this.canUpdateCalendarEventRecordingPreferenceForCalendarEvent({
          calendarEvent,
          userWorkspaceId,
          workspaceMemberId,
          workspaceId,
        });
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private async findCalendarEvent({
    calendarEventId,
    workspaceId,
  }: {
    calendarEventId: string;
    workspaceId: string;
  }): Promise<CalendarEventWorkspaceEntity | null> {
    const calendarEventRepository =
      await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
        workspaceId,
        'calendarEvent',
      );

    return calendarEventRepository.findOne({
      where: { id: calendarEventId },
      relations: [
        'calendarEventParticipants',
        'calendarChannelEventAssociations',
      ],
    });
  }

  private async canUpdateCalendarEventRecordingPreferenceForCalendarEvent({
    calendarEvent,
    userWorkspaceId,
    workspaceMemberId,
    workspaceId,
  }: {
    calendarEvent: CalendarEventWorkspaceEntity;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return (
      isCalendarEventParticipant(calendarEvent, workspaceMemberId) ||
      (await this.isPersonalCalendarChannelOwner({
        calendarEvent,
        userWorkspaceId,
        workspaceId,
      }))
    );
  }

  private async isPersonalCalendarChannelOwner({
    calendarEvent,
    userWorkspaceId,
    workspaceId,
  }: {
    calendarEvent: CalendarEventWorkspaceEntity;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const calendarChannelIds = [
      ...new Set(
        calendarEvent.calendarChannelEventAssociations.map(
          (association) => association.calendarChannelId,
        ),
      ),
    ];

    if (calendarChannelIds.length === 0) {
      return false;
    }

    const ownedCalendarChannels = await this.calendarChannelRepository.find({
      where: {
        id: In(calendarChannelIds),
        workspaceId,
        connectedAccount: {
          userWorkspaceId,
        },
      },
      relations: ['connectedAccount'],
    });

    return ownedCalendarChannels.some((calendarChannel) =>
      isPersonalCalendarChannel(calendarChannel),
    );
  }
}

const isCalendarEventParticipant = (
  calendarEvent: CalendarEventWorkspaceEntity,
  workspaceMemberId: string,
): boolean =>
  calendarEvent.calendarEventParticipants.some(
    (participant) => participant.workspaceMemberId === workspaceMemberId,
  );

const isPersonalCalendarChannel = (
  calendarChannel: CalendarChannelEntity,
): boolean => {
  const connectedAccountHandles = [
    calendarChannel.connectedAccount.handle,
    ...(calendarChannel.connectedAccount.handleAliases ?? []),
  ].map(normalizeCalendarHandle);

  return connectedAccountHandles.includes(
    normalizeCalendarHandle(calendarChannel.handle),
  );
};

const normalizeCalendarHandle = (handle: string): string =>
  handle.trim().toLowerCase();
