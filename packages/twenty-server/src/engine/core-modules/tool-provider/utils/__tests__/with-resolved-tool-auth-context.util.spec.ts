import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import {
  getWorkspaceAuthContext,
  workspaceAuthContextStorage,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import {
  buildRequiredToolAuthContext,
  withResolvedToolAuthContext,
} from 'src/engine/core-modules/tool-provider/utils/with-resolved-tool-auth-context.util';

describe('withResolvedToolAuthContext', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const userId = '20202020-0000-4000-8000-000000000002';
  const userWorkspaceId = '20202020-0000-4000-8000-000000000003';
  const workspaceMemberId = '20202020-0000-4000-8000-000000000004';

  const buildContext = (
    overrides?: Partial<ToolProviderContext>,
  ): ToolProviderContext => ({
    workspaceId,
    roleId: 'role-1',
    rolePermissionConfig: { unionOf: ['role-1'] },
    ...overrides,
  });

  const buildDependencies = () => ({
    userRepository: {
      findOne: jest.fn().mockResolvedValue({
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
      }),
    },
    workspaceCacheService: {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatWorkspaceMemberMaps: {
          idByUserId: { [userId]: workspaceMemberId },
          byId: {
            [workspaceMemberId]: {
              id: workspaceMemberId,
              userId,
            },
          },
        },
      }),
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should expose a built user auth context to the dispatch via async local storage', async () => {
    const dependencies = buildDependencies();
    let storeDuringDispatch: WorkspaceAuthContext | undefined;
    let contextDuringDispatch: ToolProviderContext | undefined;

    await withResolvedToolAuthContext(
      {
        context: buildContext({ userId, userWorkspaceId }),
        ...dependencies,
      },
      async (contextWithAuth) => {
        storeDuringDispatch = workspaceAuthContextStorage.getStore();
        contextDuringDispatch = contextWithAuth;
      },
    );

    expect(dependencies.userRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(storeDuringDispatch).toMatchObject({
      type: 'user',
      userWorkspaceId,
      workspaceMemberId,
      workspace: { id: workspaceId },
    });
    expect(contextDuringDispatch?.authContext).toBe(storeDuringDispatch);
  });

  it('should reuse a provided auth context without a user lookup', async () => {
    const dependencies = buildDependencies();
    const providedAuthContext = {
      type: 'user',
      workspace: { id: workspaceId },
      userWorkspaceId,
      workspaceMemberId,
      user: { id: userId },
      workspaceMember: { id: workspaceMemberId },
    } as unknown as WorkspaceAuthContext;

    let storeDuringDispatch: WorkspaceAuthContext | undefined;

    await withResolvedToolAuthContext(
      {
        context: buildContext({ authContext: providedAuthContext }),
        ...dependencies,
      },
      async () => {
        storeDuringDispatch = workspaceAuthContextStorage.getStore();
      },
    );

    expect(dependencies.userRepository.findOne).not.toHaveBeenCalled();
    expect(storeDuringDispatch).toBe(providedAuthContext);
  });

  it('should run the dispatch outside any auth context when no identity is resolvable', async () => {
    const dependencies = buildDependencies();
    const context = buildContext();

    let storeDuringDispatch: WorkspaceAuthContext | undefined | null = null;
    let contextDuringDispatch: ToolProviderContext | undefined;

    await withResolvedToolAuthContext(
      { context, ...dependencies },
      async (contextWithAuth) => {
        storeDuringDispatch = workspaceAuthContextStorage.getStore();
        contextDuringDispatch = contextWithAuth;
      },
    );

    expect(dependencies.userRepository.findOne).not.toHaveBeenCalled();
    expect(storeDuringDispatch).toBeUndefined();
    expect(contextDuringDispatch).toBe(context);
  });

  it('should not leak the auth context outside the dispatch', async () => {
    const dependencies = buildDependencies();

    await withResolvedToolAuthContext(
      {
        context: buildContext({ userId, userWorkspaceId }),
        ...dependencies,
      },
      async () => {},
    );

    expect(() => getWorkspaceAuthContext()).toThrow(
      'Workspace auth context not set',
    );
  });

  it('should return the dispatch result', async () => {
    const dependencies = buildDependencies();

    const result = await withResolvedToolAuthContext(
      {
        context: buildContext({ userId, userWorkspaceId }),
        ...dependencies,
      },
      async () => ({ success: true as const }),
    );

    expect(result).toEqual({ success: true });
  });
});

describe('buildRequiredToolAuthContext', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const userId = '20202020-0000-4000-8000-000000000002';
  const userWorkspaceId = '20202020-0000-4000-8000-000000000003';

  const buildContext = (
    overrides?: Partial<ToolProviderContext>,
  ): ToolProviderContext => ({
    workspaceId,
    roleId: 'role-1',
    rolePermissionConfig: { unionOf: ['role-1'] },
    ...overrides,
  });

  it('should throw without a resolvable identity', async () => {
    await expect(
      buildRequiredToolAuthContext({
        context: buildContext(),
        userRepository: { findOne: jest.fn() },
        workspaceCacheService: { getOrRecompute: jest.fn() },
      }),
    ).rejects.toThrow(AuthException);
  });

  it('should throw when the user cannot be found', async () => {
    await expect(
      buildRequiredToolAuthContext({
        context: buildContext({ userId, userWorkspaceId }),
        userRepository: { findOne: jest.fn().mockResolvedValue(null) },
        workspaceCacheService: { getOrRecompute: jest.fn() },
      }),
    ).rejects.toThrow('User not found');
  });

  it('should throw when the user has no workspace member', async () => {
    await expect(
      buildRequiredToolAuthContext({
        context: buildContext({ userId, userWorkspaceId }),
        userRepository: {
          findOne: jest.fn().mockResolvedValue({
            id: userId,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
          }),
        },
        workspaceCacheService: {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatWorkspaceMemberMaps: { idByUserId: {}, byId: {} },
          }),
        },
      }),
    ).rejects.toThrow('Workspace member not found');
  });
});
