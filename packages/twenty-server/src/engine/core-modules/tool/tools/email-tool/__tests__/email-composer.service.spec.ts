import { ConnectedAccountProvider } from 'twenty-shared/types';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const CONNECTED_ACCOUNT_ID = '20202020-1111-4111-8111-111111111111';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const OTHER_CONNECTED_ACCOUNT_ID = '20202020-4444-4444-8444-444444444444';

const buildAccount = (
  id: string,
  overrides: {
    userWorkspaceId?: string;
    visibility?: 'user' | 'workspace';
    handle?: string;
  } = {},
) => ({
  id,
  handle: overrides.handle ?? 'tim@apple.dev',
  provider: ConnectedAccountProvider.GOOGLE,
  scopes: ['email'],
  connectionParameters: null,
  messageChannels: [
    { id: 'message-channel-1', handle: overrides.handle ?? 'tim@apple.dev' },
  ],
  userWorkspaceId: overrides.userWorkspaceId ?? USER_WORKSPACE_ID,
  visibility: overrides.visibility ?? 'user',
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
      ),
    ).rejects.toThrow('Connected account id is not a valid UUID');
  });

  it('throws when no connected account matches the provided id', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(null);

    await expect(
      service.composeEmail(
        { ...baseParams, connectedAccountId: CONNECTED_ACCOUNT_ID },
        context,
      ),
    ).rejects.toThrow(`No connected account found for id`);
  });

  describe('when the caller names no connected account', () => {
    const callerContext = {
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    };

    it("composes from the caller's own account, not the first in the workspace", async () => {
      const ownAccount = buildAccount(CONNECTED_ACCOUNT_ID);

      connectedAccountRepository.find.mockResolvedValue([
        buildAccount(OTHER_CONNECTED_ACCOUNT_ID, {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          handle: 'colleague@apple.dev',
        }),
        ownAccount,
      ]);
      connectedAccountRepository.findOne.mockResolvedValue(ownAccount);

      const result = await service.composeEmail(baseParams, callerContext);

      expect(result.success).toBe(true);
      expect(connectedAccountRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: CONNECTED_ACCOUNT_ID, workspaceId: WORKSPACE_ID },
        }),
      );
    });

    it('throws rather than composing from a colleague account', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount(OTHER_CONNECTED_ACCOUNT_ID, {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          handle: 'colleague@apple.dev',
        }),
      ]);

      await expect(
        service.composeEmail(baseParams, callerContext),
      ).rejects.toThrow('No connected account available for user workspace');

      expect(connectedAccountRepository.findOne).not.toHaveBeenCalled();
    });

    it('keeps the first workspace account when there is no caller (workflow run)', async () => {
      const firstAccount = buildAccount(OTHER_CONNECTED_ACCOUNT_ID, {
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        handle: 'colleague@apple.dev',
      });

      connectedAccountRepository.find.mockResolvedValue([
        firstAccount,
        buildAccount(CONNECTED_ACCOUNT_ID),
      ]);
      connectedAccountRepository.findOne.mockResolvedValue(firstAccount);

      const result = await service.composeEmail(baseParams, context);

      expect(result.success).toBe(true);
      expect(connectedAccountRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: OTHER_CONNECTED_ACCOUNT_ID, workspaceId: WORKSPACE_ID },
        }),
      );
    });
  });

  it('rejects a connected account id belonging to another user', async () => {
    connectedAccountRepository.findOne.mockResolvedValue(
      buildAccount(OTHER_CONNECTED_ACCOUNT_ID, {
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        handle: 'colleague@apple.dev',
      }),
    );

    await expect(
      service.composeEmail(
        { ...baseParams, connectedAccountId: OTHER_CONNECTED_ACCOUNT_ID },
        { workspaceId: WORKSPACE_ID, userWorkspaceId: USER_WORKSPACE_ID },
      ),
    ).rejects.toThrow('does not belong to user workspace');
  });
});
