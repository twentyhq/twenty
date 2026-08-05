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

  it('should build a user auth context from the tool identity', async () => {
    const authContext = await buildRequiredToolAuthContext({
      context: buildContext({ userId, userWorkspaceId }),
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
