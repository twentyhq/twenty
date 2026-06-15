import { ConnectedAccountProvider } from 'twenty-shared/types';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const CONNECTED_ACCOUNT_ID = '20202020-1111-4111-8111-111111111111';

const buildAccount = (id: string) => ({
  id,
  handle: 'tim@apple.dev',
  provider: ConnectedAccountProvider.GOOGLE,
  scopes: ['email'],
  connectionParameters: null,
  messageChannels: [{ id: 'message-channel-1', handle: 'tim@apple.dev' }],
});

const baseParams = {
  recipients: { to: 'test@example.com' },
  subject: 'Subject',
  body: '<p>body</p>',
  files: [],
};

const context = { workspaceId: WORKSPACE_ID };

describe('EmailComposerService connected account resolution', () => {
  let service: EmailComposerService;
  let connectedAccountRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let globalWorkspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    connectedAccountRepository = { findOne: jest.fn(), find: jest.fn() };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback) => callback()),
      getRepository: jest.fn(),
    };

    service = new EmailComposerService(
      globalWorkspaceOrmManager as never,
      connectedAccountRepository as never,
      { find: jest.fn() } as never,
      {} as never,
    );
  });

  it('uses the connected account matching the provided id', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(
      buildAccount(CONNECTED_ACCOUNT_ID),
    );

    const result = await service.composeEmail(
      { ...baseParams, connectedAccountId: CONNECTED_ACCOUNT_ID },
      context,
      { attachmentsFileFolder: 'Workflow' as never },
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.connectedAccount.id).toBe(
      CONNECTED_ACCOUNT_ID,
    );
    expect(connectedAccountRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: CONNECTED_ACCOUNT_ID, workspaceId: WORKSPACE_ID },
      }),
    );
  });

  it('throws when the id is not a valid UUID', async () => {
    await expect(
      service.composeEmail(
        { ...baseParams, connectedAccountId: 'not-a-uuid' },
        context,
        { attachmentsFileFolder: 'Workflow' as never },
      ),
    ).rejects.toThrow('Connected account id is not a valid UUID');
  });

  it('throws when no connected account matches the provided id', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(null);

    await expect(
      service.composeEmail(
        { ...baseParams, connectedAccountId: CONNECTED_ACCOUNT_ID },
        context,
        { attachmentsFileFolder: 'Workflow' as never },
      ),
    ).rejects.toThrow(`No connected account found for id`);
  });
});
