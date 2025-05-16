import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateConnectedAccountService } from 'src/engine/core-modules/auth/services/create-connected-account.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { CreateMessageFolderService } from 'src/engine/core-modules/auth/services/create-message-folder.service';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { ResetCalendarChannelService } from 'src/engine/core-modules/auth/services/reset-calendar-channel.service';
import { ResetMessageChannelService } from 'src/engine/core-modules/auth/services/reset-message-channel.service';
import { ResetMessageFolderService } from 'src/engine/core-modules/auth/services/reset-message-folder.service';
import { UpdateConnectedAccountOnReconnectService } from 'src/engine/core-modules/auth/services/update-connected-account-on-reconnect.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('MicrosoftAPIsService', () => {
  let service: MicrosoftAPIsService;
  let resetCalendarChannelService: ResetCalendarChannelService;
  let resetMessageChannelService: ResetMessageChannelService;
  let createMessageChannelService: CreateMessageChannelService;

  const mockConnectedAccountRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockCalendarChannelRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockMessageChannelRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockWorkspaceMemberRepository = {
    findOneOrFail: jest.fn(),
  };

  const mockWorkspaceDataSource = {
    transaction: jest.fn((callback) => callback({})),
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
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest
              .fn()
              .mockImplementation((workspaceId, entity) => {
                if (entity === 'connectedAccount')
                  return mockConnectedAccountRepository;
                if (entity === 'calendarChannel')
                  return mockCalendarChannelRepository;
                if (entity === 'messageChannel')
                  return mockMessageChannelRepository;
                if (entity === 'workspaceMember')
                  return mockWorkspaceMemberRepository;

                return {};
              }),
            getDataSourceForWorkspace: jest
              .fn()
              .mockImplementation(() => mockWorkspaceDataSource),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'metadata'),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
        {
          provide: ResetCalendarChannelService,
          useValue: {
            resetCalendarChannels: jest.fn(),
          },
        },
        {
          provide: ResetMessageChannelService,
          useValue: {
            resetMessageChannels: jest.fn(),
          },
        },
        {
          provide: ResetMessageFolderService,
          useValue: {
            resetMessageFolders: jest.fn(),
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
          provide: CreateMessageFolderService,
          useValue: {
            createMessageFolders: jest.fn(),
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
          provide: WorkspaceEventEmitter,
          useValue: {
            emitDatabaseBatchEvent: jest.fn(),
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
      ],
    }).compile();

    service = module.get<MicrosoftAPIsService>(MicrosoftAPIsService);
    resetCalendarChannelService = module.get<ResetCalendarChannelService>(
      ResetCalendarChannelService,
    );
    resetMessageChannelService = module.get<ResetMessageChannelService>(
      ResetMessageChannelService,
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
        accountOwnerId: 'workspace-member-id',
        provider: ConnectedAccountProvider.MICROSOFT,
      } as ConnectedAccountWorkspaceEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValue(
        existingConnectedAccount,
      );

      mockWorkspaceMemberRepository.findOneOrFail.mockResolvedValue({
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
        workspaceMemberId: 'workspace-member-id',
        workspaceId: 'workspace-id',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
      });

      expect(
        resetCalendarChannelService.resetCalendarChannels,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        connectedAccountId: 'existing-account-id',
        manager: expect.any(Object),
      });

      expect(
        resetMessageChannelService.resetMessageChannels,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        connectedAccountId: 'existing-account-id',
        manager: expect.any(Object),
      });

      expect(
        createMessageChannelService.createMessageChannel,
      ).not.toHaveBeenCalled();
    });
  });
});
