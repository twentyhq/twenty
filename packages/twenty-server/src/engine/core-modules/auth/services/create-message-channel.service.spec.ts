import { Test, type TestingModule } from '@nestjs/testing';

import { type EntityManager } from 'typeorm';
import { MessageChannelVisibility } from 'twenty-shared/types';

import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

// This fallback is the effective setting for every connection path that does not ask the
// user for a visibility: the "Connect with Google/Microsoft" buttons in Settings >
// Accounts, and the IMAP/SMTP/CalDAV flow. Both call `createMessageChannel` without a
// `messageVisibility`.
describe('CreateMessageChannelService', () => {
  let service: CreateMessageChannelService;

  const save = jest.fn();
  const mockTransactionManager = {
    getRepository: jest.fn().mockReturnValue({ save }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMessageChannelService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn((callback) => callback()),
          },
        },
      ],
    }).compile();

    service = module.get<CreateMessageChannelService>(
      CreateMessageChannelService,
    );
  });

  const createMessageChannel = (messageVisibility?: MessageChannelVisibility) =>
    service.createMessageChannel({
      workspaceId: 'workspace-id',
      connectedAccountId: 'connected-account-id',
      handle: 'tim@apple.dev',
      messageVisibility,
      transactionManager: mockTransactionManager,
    });

  it('should default to METADATA when no visibility is requested', async () => {
    await createMessageChannel();

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: MessageChannelVisibility.METADATA,
      }),
    );
  });

  it('should keep an explicit SHARE_EVERYTHING', async () => {
    await createMessageChannel(MessageChannelVisibility.SHARE_EVERYTHING);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      }),
    );
  });

  it('should keep an explicit SUBJECT', async () => {
    await createMessageChannel(MessageChannelVisibility.SUBJECT);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: MessageChannelVisibility.SUBJECT,
      }),
    );
  });
});
