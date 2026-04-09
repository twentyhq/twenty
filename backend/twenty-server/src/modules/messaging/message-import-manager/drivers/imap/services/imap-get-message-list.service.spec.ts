import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';

const createMockFolder = (
  overrides: Partial<MessageFolder> &
    Pick<MessageFolder, 'name' | 'externalId' | 'isSynced'>,
): MessageFolder => ({
  id: `folder-${overrides.externalId}`,
  syncCursor: null,
  isSentFolder: false,
  parentFolderId: null,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  ...overrides,
});

describe('ImapGetMessageListService', () => {
  let service: ImapGetMessageListService;
  let imapClientProvider: ImapClientProvider;

  const mockConnectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    | 'provider'
    | 'accessToken'
    | 'refreshToken'
    | 'id'
    | 'handle'
    | 'connectionParameters'
  > = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    handle: 'test@example.com',
    connectionParameters: {},
  };

  const mockImapClient = {
    getMailboxLock: jest.fn().mockResolvedValue({ release: jest.fn() }),
    mailbox: {
      uidValidity: 12345,
      uidNext: 100,
      highestModseq: '1000',
    },
    capabilities: new Set(['CONDSTORE']),
    status: jest.fn().mockResolvedValue({
      uidValidity: 12345,
      uidNext: 100,
      highestModseq: '1000',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapGetMessageListService,
        {
          provide: ImapClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockImapClient),
            closeClient: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ImapSyncService,
          useValue: {
            syncFolder: jest.fn().mockResolvedValue({ messageUids: [1, 2, 3] }),
          },
        },
        {
          provide: ImapMessageListFetchErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImapGetMessageListService>(ImapGetMessageListService);
    imapClientProvider = module.get<ImapClientProvider>(ImapClientProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('folder filtering based on import policy', () => {
    it('should only process synced folders when SELECTED_FOLDERS policy is set', async () => {
      const syncedFolder = createMockFolder({
        name: 'INBOX',
        externalId: 'INBOX:1',
        isSynced: true,
      });

      const nonSyncedFolder = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        messageFolders: [syncedFolder, nonSyncedFolder],
      });

      expect(result).toHaveLength(1);
      expect(result[0].folderId).toBe(syncedFolder.id);
    });

    it('should process all folders when ALL_FOLDERS policy is set', async () => {
      const syncedFolder = createMockFolder({
        name: 'INBOX',
        externalId: 'INBOX:1',
        isSynced: true,
      });

      const nonSyncedFolder = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [syncedFolder, nonSyncedFolder],
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.folderId)).toEqual([
        syncedFolder.id,
        nonSyncedFolder.id,
      ]);
    });

    it('should return empty array when SELECTED_FOLDERS policy and no folders are synced', async () => {
      const nonSyncedFolder1 = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
        isSynced: false,
      });

      const nonSyncedFolder2 = createMockFolder({
        name: 'Work',
        externalId: 'Work:1',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        messageFolders: [nonSyncedFolder1, nonSyncedFolder2],
      });

      expect(result).toHaveLength(0);
    });

    it('should process all non-synced folders when ALL_FOLDERS policy is set', async () => {
      const nonSyncedFolder1 = createMockFolder({
        name: 'Personal',
        externalId: 'Personal:1',
        isSynced: false,
      });

      const nonSyncedFolder2 = createMockFolder({
        name: 'Work',
        externalId: 'Work:1',
        isSynced: false,
      });

      const result = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [nonSyncedFolder1, nonSyncedFolder2],
      });

      expect(result).toHaveLength(2);
    });

    it('should always close the IMAP client regardless of policy', async () => {
      const folder = createMockFolder({
        name: 'INBOX',
        externalId: 'INBOX:1',
        isSynced: true,
      });

      await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        messageFolders: [folder],
      });

      expect(imapClientProvider.closeClient).toHaveBeenCalledTimes(1);
    });
  });
});
