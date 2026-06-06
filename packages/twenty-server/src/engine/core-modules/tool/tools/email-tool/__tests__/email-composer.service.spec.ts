import { randomUUID } from 'node:crypto';

import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { type ComposeEmailParams } from 'src/engine/core-modules/tool/tools/email-tool/types/compose-email-params.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = randomUUID();
const ALICE_USER_WORKSPACE_ID = randomUUID();
const BOB_USER_WORKSPACE_ID = randomUUID();

const ALICE_ACCOUNT_ID = randomUUID();
const BOB_ACCOUNT_ID = randomUUID();
const SHARED_ACCOUNT_ID = randomUUID();

// In-memory connected accounts that mimic the rows TypeORM would return.
type FakeAccount = Partial<ConnectedAccountEntity> & { id: string };

const aliceUserPrivateAccount: FakeAccount = {
  id: ALICE_ACCOUNT_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: ALICE_USER_WORKSPACE_ID,
  visibility: 'user',
  handle: 'alice@example.com',
  provider: ConnectedAccountProvider.GOOGLE,
  connectionParameters: null,
  messageChannels: [{ id: 'mc-alice', handle: 'alice@example.com' }] as never,
};

const bobUserPrivateAccount: FakeAccount = {
  id: BOB_ACCOUNT_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: BOB_USER_WORKSPACE_ID,
  visibility: 'user',
  handle: 'bob@example.com',
  provider: ConnectedAccountProvider.GOOGLE,
  connectionParameters: null,
  messageChannels: [{ id: 'mc-bob', handle: 'bob@example.com' }] as never,
};

// Workspace-visibility account (owned by Alice but shared with the workspace).
const sharedWorkspaceAccount: FakeAccount = {
  id: SHARED_ACCOUNT_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: ALICE_USER_WORKSPACE_ID,
  visibility: 'workspace',
  handle: 'team@example.com',
  provider: ConnectedAccountProvider.GOOGLE,
  connectionParameters: null,
  messageChannels: [{ id: 'mc-shared', handle: 'team@example.com' }] as never,
};

// Mirrors ConnectedAccountMetadataService's visibility rule: an account is
// usable by a caller when it is workspace-shared, or it belongs to the caller's
// own user workspace. The authoritative scoping is proven directly against the
// repository in connected-account-metadata.service.spec.ts; here we stub the
// finders so these tests focus on the composer's own selection/rejection logic.
const isVisibleToCaller = (
  account: FakeAccount,
  userWorkspaceId: string | undefined,
): boolean =>
  account.visibility === 'workspace' ||
  (isDefined(userWorkspaceId) && account.userWorkspaceId === userWorkspaceId);

const buildComposeParams = (
  overrides: Partial<ComposeEmailParams> = {},
): ComposeEmailParams => ({
  recipients: { to: 'recipient@example.com' },
  subject: 'Hello',
  body: '<p>Hello</p>',
  ...overrides,
});

describe('EmailComposerService - connected account authorization', () => {
  let service: EmailComposerService;
  let accounts: FakeAccount[];

  beforeEach(async () => {
    accounts = [
      aliceUserPrivateAccount,
      bobUserPrivateAccount,
      sharedWorkspaceAccount,
    ];

    const mockConnectedAccountMetadataService = {
      findAccessibleConnectedAccountById: jest.fn(
        ({ id, userWorkspaceId, workspaceId }) =>
          Promise.resolve(
            accounts.find(
              (account) =>
                account.id === id &&
                account.workspaceId === workspaceId &&
                isVisibleToCaller(account, userWorkspaceId),
            ) ?? null,
          ),
      ),
      findById: jest.fn(({ id, workspaceId }) =>
        Promise.resolve(
          accounts.find(
            (account) =>
              account.id === id && account.workspaceId === workspaceId,
          ) ?? null,
        ),
      ),
      findAccessibleConnectedAccounts: jest.fn(
        ({ userWorkspaceId, workspaceId }) => {
          const accessibleAccounts = accounts.filter(
            (account) =>
              account.workspaceId === workspaceId &&
              isVisibleToCaller(account, userWorkspaceId),
          );

          return Promise.resolve({
            userConnectedAccounts: accessibleAccounts.filter(
              (account) => account.userWorkspaceId === userWorkspaceId,
            ),
            workspaceSharedConnectedAccounts: accessibleAccounts.filter(
              (account) => account.userWorkspaceId !== userWorkspaceId,
            ),
          });
        },
      ),
    };

    const mockGlobalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((fn: () => unknown) => fn()),
      getRepository: jest.fn(),
    };

    const mockFileRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockFileService = {
      getFileStreamById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailComposerService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        {
          provide: ConnectedAccountMetadataService,
          useValue: mockConnectedAccountMetadataService,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
          useValue: mockFileRepository,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get<EmailComposerService>(EmailComposerService);
  });

  const compose = (params: ComposeEmailParams, context: ToolExecutionContext) =>
    service.composeEmail(params, context, {
      attachmentsFileFolder: FileFolder.Workflow,
    });

  describe('explicit connectedAccountId', () => {
    it("should reject sending from another member's user-private account (impersonation)", async () => {
      const bobContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
      };

      // Bob asks to send FROM Alice's private account.
      await expect(
        compose(
          buildComposeParams({
            connectedAccountId: aliceUserPrivateAccount.id,
          }),
          bobContext,
        ),
      ).rejects.toThrow(
        `Connected Account '${aliceUserPrivateAccount.id}' is private to another workspace member and cannot be used in this context`,
      );
    });

    it('should report not found for an account id that does not exist', async () => {
      const bobContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
      };
      const ghostAccountId = randomUUID();

      await expect(
        compose(
          buildComposeParams({ connectedAccountId: ghostAccountId }),
          bobContext,
        ),
      ).rejects.toThrow(`Connected Account '${ghostAccountId}' not found`);
    });

    it('should allow a member to use their own user-private account', async () => {
      const bobContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
      };

      const result = await compose(
        buildComposeParams({ connectedAccountId: bobUserPrivateAccount.id }),
        bobContext,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.connectedAccount.id).toBe(bobUserPrivateAccount.id);
      }
    });

    it('should allow any member to use a workspace-visibility account', async () => {
      const bobContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
      };

      const result = await compose(
        buildComposeParams({ connectedAccountId: sharedWorkspaceAccount.id }),
        bobContext,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.connectedAccount.id).toBe(sharedWorkspaceAccount.id);
      }
    });
  });

  describe('omitted connectedAccountId (default selection)', () => {
    it("should not silently default to another member's user-private account", async () => {
      // Only Alice's user-private account exists; Bob has none of his own.
      accounts = [aliceUserPrivateAccount];

      const bobContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
      };

      await expect(compose(buildComposeParams(), bobContext)).rejects.toThrow();
    });

    it('should prefer the caller own account over a workspace-visibility account', async () => {
      const bobContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: BOB_USER_WORKSPACE_ID,
      };

      const result = await compose(buildComposeParams(), bobContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.connectedAccount.userWorkspaceId).toBe(
          BOB_USER_WORKSPACE_ID,
        );
      }
    });
  });

  describe('system/workflow execution without a user identity', () => {
    it('should reject a user-private account when no userWorkspaceId is present', async () => {
      const systemContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
      };

      await expect(
        compose(
          buildComposeParams({
            connectedAccountId: aliceUserPrivateAccount.id,
          }),
          systemContext,
        ),
      ).rejects.toThrow(
        `Connected Account '${aliceUserPrivateAccount.id}' is private to another workspace member and cannot be used in this context`,
      );
    });

    it('should allow a user-private account when the acting user owns it', async () => {
      const workflowActingAsAliceContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: ALICE_USER_WORKSPACE_ID,
      };

      const result = await compose(
        buildComposeParams({ connectedAccountId: aliceUserPrivateAccount.id }),
        workflowActingAsAliceContext,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.connectedAccount.id).toBe(
          aliceUserPrivateAccount.id,
        );
      }
    });

    it('should allow a workspace-visibility account when no userWorkspaceId is present', async () => {
      const systemContext: ToolExecutionContext = {
        workspaceId: WORKSPACE_ID,
      };

      const result = await compose(
        buildComposeParams({ connectedAccountId: sharedWorkspaceAccount.id }),
        systemContext,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.connectedAccount.id).toBe(sharedWorkspaceAccount.id);
      }
    });
  });
});
