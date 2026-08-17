import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { buildRequiredToolAuthContext } from 'src/engine/core-modules/tool-provider/utils/build-required-tool-auth-context.util';

describe('buildRequiredToolAuthContext', () => {
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

  afterEach(() => {
    jest.clearAllMocks();
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
    userWorkspaceRepository: {
      findOne: jest.fn().mockResolvedValue({
        id: userWorkspaceId,
        userId,
        workspaceId,
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

  it('should build a user auth context from the tool identity', async () => {
    const dependencies = buildDependencies();

    const authContext = await buildRequiredToolAuthContext({
      context: buildContext({ userId, userWorkspaceId }),
      ...dependencies,
    });

    expect(dependencies.userWorkspaceRepository.findOne).toHaveBeenCalledWith({
      where: { id: userWorkspaceId, userId, workspaceId },
    });
    expect(authContext).toMatchObject({
      type: 'user',
      userWorkspaceId,
      workspaceMemberId,
      workspace: { id: workspaceId },
    });
  });

  it('should throw without a resolvable identity', async () => {
    await expect(
      buildRequiredToolAuthContext({
        context: buildContext(),
        ...buildDependencies(),
      }),
    ).rejects.toThrow(AuthException);
  });

  it('should throw when the userWorkspace does not bind this user to this workspace', async () => {
    const dependencies = buildDependencies();

    dependencies.userWorkspaceRepository.findOne.mockResolvedValue(null);

    await expect(
      buildRequiredToolAuthContext({
        context: buildContext({ userId, userWorkspaceId }),
        ...dependencies,
      }),
    ).rejects.toThrow('User workspace not found');
    expect(dependencies.userRepository.findOne).not.toHaveBeenCalled();
  });

  it('should throw when the user cannot be found', async () => {
    const dependencies = buildDependencies();

    dependencies.userRepository.findOne.mockResolvedValue(null);

    await expect(
      buildRequiredToolAuthContext({
        context: buildContext({ userId, userWorkspaceId }),
        ...dependencies,
      }),
    ).rejects.toThrow('User not found');
  });

  it('should throw when the user has no workspace member', async () => {
    const dependencies = buildDependencies();

    dependencies.workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatWorkspaceMemberMaps: { idByUserId: {}, byId: {} },
    });

    await expect(
      buildRequiredToolAuthContext({
        context: buildContext({ userId, userWorkspaceId }),
        ...dependencies,
      }),
    ).rejects.toThrow('Workspace member not found');
  });
});
