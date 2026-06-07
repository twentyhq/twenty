import { type Repository } from 'typeorm';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CalendarEventRecordingPreferenceService } from 'src/engine/core-modules/calendar/calendar-event-recording-preference.service';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';
const CALENDAR_EVENT_ID = 'calendar-event-id';
const AUTH_CONTEXT = {} as UserWorkspaceAuthContext;

const buildCalendarEvent = (
  overrides: Partial<CalendarEventWorkspaceEntity> = {},
): CalendarEventWorkspaceEntity => ({
  id: CALENDAR_EVENT_ID,
  title: 'Customer call',
  description: '',
  isCanceled: false,
  isFullDay: false,
  startsAt: '2026-06-05T11:00:00.000Z',
  endsAt: '2026-06-05T12:00:00.000Z',
  location: '',
  conferenceLink: {
    primaryLinkLabel: 'Google Meet',
    primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
    secondaryLinks: null,
  },
  externalCreatedAt: '2026-06-01T10:00:00.000Z',
  externalUpdatedAt: '2026-06-01T10:00:00.000Z',
  deletedAt: null,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  iCalUid: 'ical-uid',
  conferenceSolution: 'googleMeet',
  recordingPreference: 'AUTO',
  calendarChannelEventAssociations: [],
  calendarEventParticipants: [
    {
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    } as CalendarEventParticipantWorkspaceEntity,
  ],
  ...overrides,
});

describe('CalendarEventRecordingPreferenceService', () => {
  it('should not update the preference when the user fails custom calendar authorization', async () => {
    const calendarEventRepository = {
      findOne: jest.fn().mockResolvedValue(
        buildCalendarEvent({
          calendarEventParticipants: [],
        }),
      ),
      update: jest.fn(),
    };

    const globalWorkspaceOrmManager = {
      getRepository: jest.fn().mockResolvedValue(calendarEventRepository),
      executeInWorkspaceContext: jest.fn((callback: () => unknown) =>
        callback(),
      ),
    };

    const service = new CalendarEventRecordingPreferenceService(
      globalWorkspaceOrmManager as unknown as GlobalWorkspaceOrmManager,
      {} as Repository<CalendarChannelEntity>,
    );

    await expect(
      service.updateCalendarEventRecordingPreference({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        calendarEventId: CALENDAR_EVENT_ID,
        recordingPreference: 'ON',
        authContext: AUTH_CONTEXT,
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(calendarEventRepository.update).not.toHaveBeenCalled();
  });

  it('should throw when the preference update affects no rows', async () => {
    const calendarEventRepository = {
      findOne: jest.fn().mockResolvedValue(buildCalendarEvent()),
      update: jest.fn().mockResolvedValue({ affected: 0 }),
    };

    const globalWorkspaceOrmManager = {
      getRepository: jest.fn().mockResolvedValue(calendarEventRepository),
      executeInWorkspaceContext: jest.fn((callback: () => unknown) =>
        callback(),
      ),
    };

    const service = new CalendarEventRecordingPreferenceService(
      globalWorkspaceOrmManager as unknown as GlobalWorkspaceOrmManager,
      {} as Repository<CalendarChannelEntity>,
    );

    await expect(
      service.updateCalendarEventRecordingPreference({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        calendarEventId: CALENDAR_EVENT_ID,
        recordingPreference: 'ON',
        authContext: AUTH_CONTEXT,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(calendarEventRepository.update).toHaveBeenCalledWith(
      CALENDAR_EVENT_ID,
      {
        recordingPreference: 'ON',
      },
    );
  });
});
