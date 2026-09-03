import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IsNull } from 'typeorm';

import { FindConnectedAccountsTool } from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const ownAccount = {
  id: 'own-account-id',
  handle: 'me@example.com',
  handleAliases: ['me.alias@example.com'],
  provider: ConnectedAccountProvider.GOOGLE,
  name: 'Me',
  visibility: 'user' as const,
  userWorkspaceId: USER_WORKSPACE_ID,
  accessToken: 'enc:v2:secret-token',
};

const colleagueAccount = {
  id: 'colleague-account-id',
  handle: 'colleague@example.com',
  handleAliases: null,
  provider: ConnectedAccountProvider.GOOGLE,
  name: 'Colleague',
  visibility: 'user' as const,
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  accessToken: 'enc:v2:other-secret',
};

const sharedAccount = {
  id: 'shared-account-id',
  handle: 'team@example.com',
  handleAliases: null,
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  name: 'Team',
  visibility: 'workspace' as const,
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  accessToken: 'enc:v2:shared-secret',
};

const callerContext: ToolExecutionContext = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
};

const apiKeyContext: ToolExecutionContext = {
  workspaceId: WORKSPACE_ID,
};

describe('FindConnectedAccountsTool', () => {
  let tool: FindConnectedAccountsTool;
  let mockFind: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFind = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindConnectedAccountsTool,
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn(
              (callback: () => Promise<unknown>) => callback(),
            ),
          },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { find: mockFind },
        },
      ],
    }).compile();

    tool = module.get(FindConnectedAccountsTool);
  });

  it('returns usable core-schema accounts without tokens', async () => {
    mockFind.mockResolvedValue([ownAccount, colleagueAccount, sharedAccount]);

    const output = await tool.execute({}, callerContext);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          archivedAt: IsNull(),
        }),
        select: expect.objectContaining({
          id: true,
          handle: true,
        }),
      }),
    );
    expect(mockFind.mock.calls[0][0].select.accessToken).toBeUndefined();
    expect(mockFind.mock.calls[0][0].select.refreshToken).toBeUndefined();
    expect(
      mockFind.mock.calls[0][0].select.connectionParameters,
    ).toBeUndefined();
    expect(output.success).toBe(true);
    expect(output.message).toBe('Found 2 connectedAccount records');
    expect(output.result).toEqual({
      records: [
        {
          id: 'own-account-id',
          handle: 'me@example.com',
          handleAliases: ['me.alias@example.com'],
          provider: ConnectedAccountProvider.GOOGLE,
          name: 'Me',
          visibility: 'user',
        },
        {
          id: 'shared-account-id',
          handle: 'team@example.com',
          handleAliases: null,
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          name: 'Team',
          visibility: 'workspace',
        },
      ],
      count: '2',
    });
    expect(JSON.stringify(output)).not.toContain('enc:v2:');
    expect(JSON.stringify(output)).not.toContain('accessToken');
  });

  it('returns every non-archived account when the caller has no user identity', async () => {
    mockFind.mockResolvedValue([ownAccount, colleagueAccount, sharedAccount]);

    const output = await tool.execute({}, apiKeyContext);

    expect(output.result).toEqual({
      records: [
        expect.objectContaining({ id: 'own-account-id' }),
        expect.objectContaining({ id: 'colleague-account-id' }),
        expect.objectContaining({ id: 'shared-account-id' }),
      ],
      count: '3',
    });
  });

  it('filters by handle case-insensitively including aliases', async () => {
    mockFind.mockResolvedValue([ownAccount, sharedAccount]);

    const output = await tool.execute(
      { handle: 'ME.ALIAS@example.com' },
      callerContext,
    );

    expect(output.message).toBe('Found 1 connectedAccount record');
    expect(output.result).toEqual({
      records: [
        {
          id: 'own-account-id',
          handle: 'me@example.com',
          handleAliases: ['me.alias@example.com'],
          provider: ConnectedAccountProvider.GOOGLE,
          name: 'Me',
          visibility: 'user',
        },
      ],
      count: '1',
    });
  });

  it('returns the empty MCP payload when nothing matches', async () => {
    mockFind.mockResolvedValue([]);

    const output = await tool.execute({}, callerContext);

    expect(output).toEqual({
      success: true,
      message: 'Found 0 connectedAccount records',
      result: { records: [], count: '0' },
    });
  });
});
