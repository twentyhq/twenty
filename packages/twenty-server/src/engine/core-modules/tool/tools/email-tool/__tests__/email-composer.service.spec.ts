import { ConnectedAccountProvider } from 'twenty-shared/types';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const CONNECTED_ACCOUNT_ID = '20202020-1111-4111-8111-111111111111';
const WORKSPACE_MEMBER_ID = '20202020-2222-4222-8222-222222222222';
const USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const USER_ID = '20202020-4444-4444-8444-444444444444';
const MEMBER_ACCOUNT_ID = '20202020-5555-4555-8555-555555555555';

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

describe('EmailComposerService sender resolution', () => {
  let service: EmailComposerService;
  let connectedAccountRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let userWorkspaceRepository: { findOne: jest.Mock };
  let workspaceMemberRepository: { findOne: jest.Mock };
  let globalWorkspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    connectedAccountRepository = { findOne: jest.fn(), find: jest.fn() };
    userWorkspaceRepository = { findOne: jest.fn() };
    workspaceMemberRepository = { findOne: jest.fn() };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback) => callback()),
      getRepository: jest.fn().mockResolvedValue(workspaceMemberRepository),
    };

    service = new EmailComposerService(
      globalWorkspaceOrmManager as never,
      connectedAccountRepository as never,
      userWorkspaceRepository as never,
      { find: jest.fn() } as never,
      {} as never,
    );
  });

  it('uses the account directly when the id is a connected account id', async () => {
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
    expect(workspaceMemberRepository.findOne).not.toHaveBeenCalled();
  });

  it('falls back to the workspace member first connected account on a miss', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(null);
    workspaceMemberRepository.findOne.mockResolvedValue({ userId: USER_ID });
    userWorkspaceRepository.findOne.mockResolvedValue({ id: USER_WORKSPACE_ID });
    connectedAccountRepository.find.mockResolvedValue([
      buildAccount(MEMBER_ACCOUNT_ID),
    ]);

    const result = await service.composeEmail(
      { ...baseParams, connectedAccountId: WORKSPACE_MEMBER_ID },
      context,
      { attachmentsFileFolder: 'Workflow' as never },
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.connectedAccount.id).toBe(
      MEMBER_ACCOUNT_ID,
    );
    expect(connectedAccountRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userWorkspaceId: USER_WORKSPACE_ID, workspaceId: WORKSPACE_ID },
      }),
    );
  });

  it('throws when the id matches neither a connected account nor a workspace member', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(null);
    workspaceMemberRepository.findOne.mockResolvedValue(null);

    await expect(
      service.composeEmail(
        { ...baseParams, connectedAccountId: WORKSPACE_MEMBER_ID },
        context,
        { attachmentsFileFolder: 'Workflow' as never },
      ),
    ).rejects.toThrow(`No connected account found for sender`);
  });
});
