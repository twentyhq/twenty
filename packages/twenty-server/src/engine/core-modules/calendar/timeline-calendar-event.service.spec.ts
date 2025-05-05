import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

import { TimelineCalendarEventService } from './timeline-calendar-event.service';

describe('TimelineCalendarEventService', () => {
  let service: TimelineCalendarEventService;
  let twentyORMManager: TwentyORMManager;

  const mockCalendarEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    startsAt: new Date(),
    endsAt: new Date(),
    calendarEventParticipants: [],
    calendarChannelEventAssociations: [],
  };

  const mockCalendarEventRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    twentyORMManager = {
      getRepository: jest.fn().mockResolvedValue(mockCalendarEventRepository),
    } as any;

    service = new TimelineCalendarEventService(twentyORMManager);
  });

  it('should return non-obfuscated calendar events if visibility is SHARE_EVERYTHING', async () => {
    const currentWorkspaceMemberId = 'current-workspace-member-id';
    const personIds = ['person-1'];

    mockCalendarEventRepository.find.mockResolvedValue([
      { id: '1', startsAt: new Date() },
    ]);
    mockCalendarEventRepository.findAndCount.mockResolvedValue([
      [
        {
          ...mockCalendarEvent,
          calendarChannelEventAssociations: [
            {
              calendarChannel: {
                visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
                connectedAccount: {
                  accountOwnerId: 'other-workspace-member-id',
                },
              },
            },
          ],
        },
      ],
      1,
    ]);

    const result = await service.getCalendarEventsFromPersonIds({
      currentWorkspaceMemberId,
      personIds,
      page: 1,
      pageSize: 10,
    });

    expect(result.timelineCalendarEvents[0].title).toBe('Test Event');
    expect(result.timelineCalendarEvents[0].description).toBe(
      'Test Description',
    );
  });

  it('should return obfuscated calendar events if visibility is METADATA', async () => {
    const currentWorkspaceMemberId = 'current-workspace-member-id';
    const personIds = ['person-1'];

    mockCalendarEventRepository.find.mockResolvedValue([
      { id: '1', startsAt: new Date() },
    ]);
    mockCalendarEventRepository.findAndCount.mockResolvedValue([
      [
        {
          ...mockCalendarEvent,
          calendarChannelEventAssociations: [
            {
              calendarChannel: {
                visibility: CalendarChannelVisibility.METADATA,
                connectedAccount: {
                  accountOwnerId: 'other-workspace-member-id',
                },
              },
            },
          ],
        },
      ],
      1,
    ]);

    const result = await service.getCalendarEventsFromPersonIds({
      currentWorkspaceMemberId,
      personIds,
      page: 1,
      pageSize: 10,
    });

    expect(result.timelineCalendarEvents[0].title).toBe(
      FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    );
    expect(result.timelineCalendarEvents[0].description).toBe(
      FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    );
  });

  it('should return non-obfuscated calendar events if visibility is METADATA and user is calendar events owner', async () => {
    const currentWorkspaceMemberId = 'current-workspace-member-id';
    const personIds = ['person-1'];

    mockCalendarEventRepository.find.mockResolvedValue([
      { id: '1', startsAt: new Date() },
    ]);
    mockCalendarEventRepository.findAndCount.mockResolvedValue([
      [
        {
          ...mockCalendarEvent,
          calendarChannelEventAssociations: [
            {
              calendarChannel: {
                visibility: CalendarChannelVisibility.METADATA,
                connectedAccount: {
                  accountOwnerId: 'current-workspace-member-id',
                },
              },
            },
          ],
        },
      ],
      1,
    ]);

    const result = await service.getCalendarEventsFromPersonIds({
      currentWorkspaceMemberId,
      personIds,
      page: 1,
      pageSize: 10,
    });

    expect(result.timelineCalendarEvents[0].title).toBe('Test Event');
    expect(result.timelineCalendarEvents[0].description).toBe(
      'Test Description',
    );
  });
});
