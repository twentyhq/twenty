import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { CalendarChannelVisibility } from 'twenty-shared/types';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
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
  let mockCalendarChannelCoreRepository: { find: jest.Mock };
  let mockConnectedAccountRepository: { find: jest.Mock };
  let mockUserWorkspaceRepository: { findOne: jest.Mock };
  let mockWorkspaceMemberRepository: { findOne: jest.Mock };

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

    mockConnectedAccountRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    mockCalendarChannelCoreRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    mockUserWorkspaceRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockWorkspaceMemberRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const mockGlobalWorkspaceOrmManager = {
      getRepository: jest
        .fn()
        .mockImplementation((_workspaceId, entityName) => {
          if (entityName === 'workspaceMember') {
            return Promise.resolve(mockWorkspaceMemberRepository);
          }

          return Promise.resolve(mockCalendarEventRepository);
        }),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((fn: () => any, _authContext?: any) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineCalendarEventService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: mockCalendarChannelCoreRepository,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: mockConnectedAccountRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: mockUserWorkspaceRepository,
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
            { calendarChannelId: 'channel-1' },
          ],
        },
      ],
      1,
    ]);
    mockCalendarChannelCoreRepository.find.mockResolvedValue([
      {
        id: 'channel-1',
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        connectedAccountId: 'connected-account-1',
      },
    ]);
    // Ownership doesn't matter for SHARE_EVERYTHING
    mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);

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
            { calendarChannelId: 'channel-1' },
          ],
        },
      ],
      1,
    ]);
    mockCalendarChannelCoreRepository.find.mockResolvedValue([
      {
        id: 'channel-1',
        visibility: CalendarChannelVisibility.METADATA,
        connectedAccountId: 'connected-account-1',
      },
    ]);
    // Current user resolves but doesn't own the account
    mockWorkspaceMemberRepository.findOne.mockResolvedValue({
      userId: 'current-user-id',
    });
    mockUserWorkspaceRepository.findOne.mockResolvedValue({
      id: 'current-uw-id',
    });
    mockConnectedAccountRepository.find.mockResolvedValue([]);

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
            { calendarChannelId: 'channel-1' },
          ],
        },
      ],
      1,
    ]);
    mockCalendarChannelCoreRepository.find.mockResolvedValue([
      {
        id: 'channel-1',
        visibility: CalendarChannelVisibility.METADATA,
        connectedAccountId: 'connected-account-1',
      },
    ]);
    // Current user resolves and owns the account
    mockWorkspaceMemberRepository.findOne.mockResolvedValue({
      userId: 'current-user-id',
    });
    mockUserWorkspaceRepository.findOne.mockResolvedValue({
      id: 'current-uw-id',
    });
    mockConnectedAccountRepository.find.mockResolvedValue([
      { id: 'connected-account-1' },
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
