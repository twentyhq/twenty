import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
  ConnectedAccountProvider,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('MicrosoftAPIsService', () => {
  let service: MicrosoftAPIsService;
  let messagingChannelSyncStatusService: MessageChannelSyncStatusService;
  let calendarChannelSyncStatusService: CalendarChannelSyncStatusService;
  let createMessageChannelService: CreateMessageChannelService;

  const mockConnectedAccountRepository = {
    findOne: jest.fn(),
  };

  const mockTransactionManager = {
    getRepository: jest.fn().mockReturnValue({ save: jest.fn() }),
  };

  const mockMessageChannelRepository = {
    find: jest.fn(),
    findOne: jest.fn().mockResolvedValue(null),
    manager: {
      transaction: jest.fn((callback) => callback(mockTransactionManager)),
    },
  };

  const mockCalendarChannelRepository = {
    find: jest.fn(),
  };

  const mockUserWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-workspace-id' }),
  };

  const mockWorkspaceMemberRepository = {
    findOneOrFail: jest.fn(),
    findOne: jest.fn().mockResolvedValue({
      id: 'workspace-member-id',
      userId: 'user-id',
    }),
  };

  const mockTwentyConfigService = {
    get: jest.fn(),
  };

  const mockMessageQueueService = {
    add: jest.fn(),
  };

  const mockCalendarQueueService = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicrosoftAPIsService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest
              .fn()
              .mockImplementation((_workspaceId, entity) => {
                if (entity === 'workspaceMember')
                  return mockWorkspaceMemberRepository;

                return {};
              }),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((fn: () => any, _authContext?: any) => fn()),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
        {
          provide: CalendarChannelSyncStatusService,
          useValue: {
            resetAndMarkAsCalendarEventListFetchPending: jest.fn(),
          },
        },
        {
          provide: MessageChannelSyncStatusService,
          useValue: {
            resetAndMarkAsMessagesListFetchPending: jest.fn(),
          },
        },
        {
          provide: CreateConnectedAccountService,
          useValue: {
            createConnectedAccount: jest.fn(),
          },
        },
        {
          provide: CreateMessageChannelService,
          useValue: {
            createMessageChannel: jest
              .fn()
              .mockResolvedValue('message-channel-id'),
          },
        },
        {
          provide: CreateCalendarChannelService,
          useValue: {
            createCalendarChannel: jest.fn(),
          },
        },
        {
          provide: UpdateConnectedAccountOnReconnectService,
          useValue: {
            updateConnectedAccountOnReconnect: jest.fn(),
          },
        },
        {
          provide: AccountsToReconnectService,
          useValue: {
            removeAccountToReconnect: jest.fn(),
          },
        },
        {
          provide: getQueueToken(MessageQueue.messagingQueue),
          useValue: mockMessageQueueService,
        },
        {
          provide: getQueueToken(MessageQueue.calendarQueue),
          useValue: mockCalendarQueueService,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: mockConnectedAccountRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: mockUserWorkspaceRepository,
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: mockMessageChannelRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: mockCalendarChannelRepository,
        },
        {
          provide: SyncMessageFoldersService,
          useValue: {
            syncMessageFolders: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<MicrosoftAPIsService>(MicrosoftAPIsService);
    calendarChannelSyncStatusService =
      module.get<CalendarChannelSyncStatusService>(
        CalendarChannelSyncStatusService,
      );
    messagingChannelSyncStatusService =
      module.get<MessageChannelSyncStatusService>(
        MessageChannelSyncStatusService,
      );
    createMessageChannelService = module.get<CreateMessageChannelService>(
      CreateMessageChannelService,
    );
  });

  describe('refreshMicrosoftRefreshToken', () => {
    it('should reset calendar channels and message channels', async () => {
      mockTwentyConfigService.get.mockImplementation((key) => {
        if (key === 'CALENDAR_PROVIDER_MICROSOFT_ENABLED') return true;
        if (key === 'MESSAGING_PROVIDER_MICROSOFT_ENABLED') return true;

        return false;
      });

      const existingConnectedAccount = {
        id: 'existing-account-id',
        handle: 'test@example.com',
        userWorkspaceId: 'user-workspace-id',
        provider: ConnectedAccountProvider.MICROSOFT,
      } as ConnectedAccountEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValue(
        existingConnectedAccount,
      );

      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });

      const failedCalendarChannel = {
        id: 'calendar-channel-id',
        connectedAccountId: 'existing-account-id',
        syncStatus: 'FAILED_UNKNOWN',
        syncStage: CalendarChannelSyncStage.FAILED,
      };

      mockCalendarChannelRepository.find.mockResolvedValue([
        failedCalendarChannel,
      ]);

      mockMessageChannelRepository.find.mockResolvedValue([
        {
          id: 'message-channel-id',
          connectedAccountId: 'existing-account-id',
        },
      ]);

      await service.refreshMicrosoftRefreshToken({
        handle: 'test@example.com',
        userId: 'user-id',
        workspaceMemberId: 'workspace-member-id',
        workspaceId: 'workspace-id',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
      });

      expect(
        calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending,
      ).toHaveBeenCalledWith([existingConnectedAccount.id], 'workspace-id');

      expect(
        messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending,
      ).toHaveBeenCalledWith([existingConnectedAccount.id], 'workspace-id');

      expect(
        createMessageChannelService.createMessageChannel,
      ).not.toHaveBeenCalled();
    });
  });
});
