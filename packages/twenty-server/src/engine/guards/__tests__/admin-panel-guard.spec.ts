import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';

const mockRequest = (request: Record<string, unknown>) => {
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: request }),
  } as unknown as GqlExecutionContext);
};

const buildServerAdminAccessService = (isRequestAllowed: boolean) =>
  ({
    isRequestAllowed: jest.fn().mockResolvedValue(isRequestAllowed),
  }) as unknown as ServerAdminAccessService;

const executionContext = {} as ExecutionContext;

describe('AdminPanelGuard', () => {
  it('allows a full admin whose request passes the server admin access checks', async () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);
    const request = {
      user: { canAccessFullAdminPanel: true, email: 'admin@example.com' },
    };

    mockRequest(request);

    await expect(
      new AdminPanelGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).resolves.toBe(true);
    expect(serverAdminAccessService.isRequestAllowed).toHaveBeenCalledWith(
      request,
      'admin@example.com',
    );
  });

  it('refuses a full admin whose request fails the server admin access checks', async () => {
    mockRequest({
      user: { canAccessFullAdminPanel: true, email: 'admin@example.com' },
    });

    await expect(
      new AdminPanelGuard(buildServerAdminAccessService(false)).canActivate(
        executionContext,
      ),
    ).resolves.toBe(false);
  });

  it('refuses a user who is not a full admin', async () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);

    mockRequest({ user: { canAccessFullAdminPanel: false } });

    await expect(
      new AdminPanelGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).resolves.toBe(false);
    expect(serverAdminAccessService.isRequestAllowed).not.toHaveBeenCalled();
  });

  it('refuses an impersonated session', async () => {
    mockRequest({
      user: { canAccessFullAdminPanel: true },
      impersonationContext: {
        impersonatorUserWorkspaceId: 'impersonator',
        impersonatedUserWorkspaceId: 'impersonated',
      },
    });

    await expect(
      new AdminPanelGuard(buildServerAdminAccessService(true)).canActivate(
        executionContext,
      ),
    ).resolves.toBe(false);
  });
});

describe('ServerLevelImpersonateGuard', () => {
  it('applies the server admin access checks to impersonators', async () => {
    mockRequest({
      user: { canImpersonate: true, email: 'support@example.com' },
    });

    await expect(
      new ServerLevelImpersonateGuard(
        buildServerAdminAccessService(false),
      ).canActivate(executionContext),
    ).resolves.toBe(false);
  });
});
