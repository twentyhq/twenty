import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';

describe('AdminPanelGuard', () => {
  const guard = new AdminPanelGuard();

  it('should return true if user can access full admin panel', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canAccessFullAdminPanel: true,
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
  });

  it('should return false if user cannot access full admin panel', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canAccessFullAdminPanel: false,
          },
        },
      })),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);
  });

  it('should return false for an impersonated session of a full admin', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canAccessFullAdminPanel: true,
          },
          impersonationContext: {
            impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
            impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
          },
        },
      })),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as unknown as GqlExecutionContext);

    const mockExecutionContext = {} as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);
  });
});
