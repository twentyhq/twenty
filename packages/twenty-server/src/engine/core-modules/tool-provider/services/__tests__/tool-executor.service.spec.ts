import { ToolCategory } from 'twenty-shared/ai';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import {
  getWorkspaceAuthContext,
  workspaceAuthContextStorage,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

describe('ToolExecutorService', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const userId = '20202020-0000-4000-8000-000000000002';
  const userWorkspaceId = '20202020-0000-4000-8000-000000000003';
  const workspaceMemberId = '20202020-0000-4000-8000-000000000004';

  const staticDescriptor: ToolIndexEntry = {
    name: 'save_campaign',
    label: 'Save Campaign',
    description: 'Save a campaign',
    category: ToolCategory.ACTION,
    executionRef: { kind: 'static', toolId: 'save_campaign' },
  };

  const crudDescriptor: ToolIndexEntry = {
    name: 'update_one_messageCampaign',
    label: 'Update campaign',
    description: 'Update a campaign record',
    category: ToolCategory.DATABASE_CRUD,
    executionRef: {
      kind: 'database_crud',
      objectNameSingular: 'messageCampaign',
      operation: 'update_one',
    },
  };

  const buildContext = (
    overrides?: Partial<ToolProviderContext>,
  ): ToolProviderContext => ({
    workspaceId,
    roleId: 'role-1',
    rolePermissionConfig: { unionOf: ['role-1'] },
    ...overrides,
  });

  let capturedAuthContext: WorkspaceAuthContext | undefined;
  let capturedStoreDuringExecution: WorkspaceAuthContext | undefined;
  let executeStaticTool: jest.Mock;
  let actionProvider: ToolProvider;
  let updateRecordServiceExecute: jest.Mock;
  let userRepositoryFindOne: jest.Mock;
  let workspaceCacheGetOrRecompute: jest.Mock;
  let service: ToolExecutorService;

  beforeEach(() => {
    capturedAuthContext = undefined;
    capturedStoreDuringExecution = undefined;

    executeStaticTool = jest.fn(
      async (
        _toolName: string,
        _args: Record<string, unknown>,
        _context: ToolProviderContext,
      ): Promise<ToolOutput> => {
        capturedStoreDuringExecution = workspaceAuthContextStorage.getStore();

        return { success: true, message: 'done' };
      },
    );

    actionProvider = {
      category: ToolCategory.ACTION,
      isAvailable: jest.fn().mockResolvedValue(true),
      generateDescriptors: jest.fn().mockResolvedValue([]),
      executeStaticTool,
    };

    updateRecordServiceExecute = jest.fn(
      async (params: {
        authContext: WorkspaceAuthContext;
      }): Promise<ToolOutput> => {
        capturedAuthContext = params.authContext;

        return { success: true, message: 'updated' };
      },
    );

    userRepositoryFindOne = jest.fn().mockResolvedValue({
      id: userId,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      isEmailVerified: true,
      disabled: false,
      canImpersonate: false,
      canAccessFullAdminPanel: false,
      locale: 'en',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
    });

    workspaceCacheGetOrRecompute = jest.fn().mockResolvedValue({
      flatWorkspaceMemberMaps: {
        idByUserId: { [userId]: workspaceMemberId },
        byId: {
          [workspaceMemberId]: {
            id: workspaceMemberId,
            userId,
          },
        },
      },
    });

    service = new ToolExecutorService(
      [actionProvider],
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      { execute: updateRecordServiceExecute } as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      { getOrRecompute: workspaceCacheGetOrRecompute } as never,
      { findOne: userRepositoryFindOne } as never,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should expose a built user auth context to static tools via async local storage', async () => {
    const output = await service.dispatch(
      staticDescriptor,
      {},
      buildContext({ userId, userWorkspaceId }),
    );

    expect(output.success).toBe(true);
    expect(userRepositoryFindOne).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(capturedStoreDuringExecution).toMatchObject({
      type: 'user',
      userWorkspaceId,
      workspaceMemberId,
      workspace: { id: workspaceId },
    });
  });

  it('should reuse a provided auth context for static tools without a user lookup', async () => {
    const providedAuthContext = {
      type: 'user',
      workspace: { id: workspaceId },
      userWorkspaceId,
      workspaceMemberId,
      user: { id: userId },
      workspaceMember: { id: workspaceMemberId },
    } as unknown as WorkspaceAuthContext;

    await service.dispatch(
      staticDescriptor,
      {},
      buildContext({ authContext: providedAuthContext }),
    );

    expect(userRepositoryFindOne).not.toHaveBeenCalled();
    expect(capturedStoreDuringExecution).toBe(providedAuthContext);
  });

  it('should run static tools without an auth context when no identity is resolvable', async () => {
    const output = await service.dispatch(staticDescriptor, {}, buildContext());

    expect(output.success).toBe(true);
    expect(userRepositoryFindOne).not.toHaveBeenCalled();
    expect(capturedStoreDuringExecution).toBeUndefined();
  });

  it('should not leak the auth context outside the dispatch', async () => {
    await service.dispatch(
      staticDescriptor,
      {},
      buildContext({ userId, userWorkspaceId }),
    );

    expect(() => getWorkspaceAuthContext()).toThrow(
      'Workspace auth context not set',
    );
  });

  it('should pass the resolved auth context to database crud services', async () => {
    const output = await service.dispatch(
      crudDescriptor,
      { id: '20202020-0000-4000-8000-000000000005', subject: 'Hello' },
      buildContext({ userId, userWorkspaceId }),
    );

    expect(output.success).toBe(true);
    expect(userRepositoryFindOne).toHaveBeenCalledTimes(1);
    expect(capturedAuthContext).toMatchObject({
      type: 'user',
      userWorkspaceId,
      workspaceMemberId,
    });
  });

  it('should keep rejecting database crud without a resolvable identity', async () => {
    await expect(
      service.dispatch(crudDescriptor, { id: 'record-1' }, buildContext()),
    ).rejects.toThrow(AuthException);

    expect(updateRecordServiceExecute).not.toHaveBeenCalled();
  });
});
