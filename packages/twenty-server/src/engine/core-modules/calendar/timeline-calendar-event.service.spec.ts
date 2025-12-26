import { Test, type TestingModule } from '@nestjs/testing';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

import { TimelineCalendarEventService } from './timeline-calendar-event.service';

type MockWorkspaceRepository = Partial<
  WorkspaceRepository<CalendarEventWorkspaceEntity>
> & {
  find: jest.Mock;
  findAndCount: jest.Mock;
};

describe('TimelineCalendarEventService', () => {
  let service: TimelineCalendarEventService;
  let mockCalendarEventRepository: MockWorkspaceRepository;

  const mockCalendarEvent: Partial<CalendarEventWorkspaceEntity> = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    startsAt: '2024-01-01T00:00:00.000Z',
    endsAt: '2024-01-01T01:00:00.000Z',
    calendarEventParticipants: [],
    calendarChannelEventAssociations: [],
  };

  beforeEach(async () => {
    mockCalendarEventRepository = {
      find: jest.fn(),
      findAndCount: jest.fn(),
    };

    const mockGlobalWorkspaceOrmManager = {
      getRepository: jest.fn().mockResolvedValue(mockCalendarEventRepository),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((_authContext: any, fn: () => any) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineCalendarEventService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<TimelineCalendarEventService>(
      TimelineCalendarEventService,
    );
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
      workspaceId: 'test-workspace-id',
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
      workspaceId: 'test-workspace-id',
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
      workspaceId: 'test-workspace-id',
      page: 1,
      pageSize: 10,
    });

    expect(result.timelineCalendarEvents[0].title).toBe('Test Event');
    expect(result.timelineCalendarEvents[0].description).toBe(
      'Test Description',
    );
  });
});
