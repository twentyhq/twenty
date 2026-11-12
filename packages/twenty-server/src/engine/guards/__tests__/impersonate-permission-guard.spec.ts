import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ImpersonatePermissionGuard } from 'src/engine/guards/impersonate-permission.guard';
import { type SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

describe('ImpersonateGuard', () => {
  let guard: ImpersonatePermissionGuard;
  let mockSettingPermissionsService: jest.Mocked<SettingPermissionsService>;

  beforeEach(() => {
    mockSettingPermissionsService = {
      hasPermissionFlag: jest.fn(),
    } as any;

    guard = new ImpersonatePermissionGuard(mockSettingPermissionsService);
  });

  it('should return true if user can impersonate', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canImpersonate: true,
          },
          userWorkspaceId: 'user-workspace-id',
          workspace: {
            id: 'workspace-id',
          },
        },
      })),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(
      mockSettingPermissionsService.hasPermissionFlag,
    ).not.toHaveBeenCalled();
  });

  it('should return true if user has workspace permission to impersonate', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canImpersonate: false,
          },
          userWorkspaceId: 'user-workspace-id',
          workspace: {
            id: 'workspace-id',
          },
        },
      })),
    };

    mockSettingPermissionsService.hasPermissionFlag.mockResolvedValue(true);

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(
      mockSettingPermissionsService.hasPermissionFlag,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSettingPermissionsService.hasPermissionFlag,
    ).toHaveBeenCalledWith({
      authContext: expect.objectContaining({
        type: 'pendingActivationUser',
        userWorkspaceId: 'user-workspace-id',
      }),
      permissionFlag: 'IMPERSONATE',
    });
  });

  it('should throw permission denied exception when user cannot impersonate and has no workspace permission', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canImpersonate: false,
          },
          userWorkspaceId: 'user-workspace-id',
          workspace: {
            id: 'workspace-id',
          },
        },
      })),
    };

    mockSettingPermissionsService.hasPermissionFlag.mockResolvedValue(false);

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    await expect(guard.canActivate(mockExecutionContext)).rejects.toMatchObject(
      {
        userFriendlyMessage: expect.objectContaining({
          id: expect.any(String),
          message:
            'You do not have permission to impersonate users. Please contact your workspace administrator for access.',
        }),
      },
    );
  });

  it('should throw permission denied exception when userWorkspaceId is not defined', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canImpersonate: false,
          },
          workspace: {
            id: 'workspace-id',
          },
        },
      })),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    await expect(guard.canActivate(mockExecutionContext)).rejects.toMatchObject(
      {
        userFriendlyMessage: expect.objectContaining({
          id: expect.any(String),
          message: "Can't impersonate user via api key",
        }),
      },
    );
  });
});
