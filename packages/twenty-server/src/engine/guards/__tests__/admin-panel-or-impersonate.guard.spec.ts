import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { AdminPanelOrImpersonateGuard } from 'src/engine/guards/admin-panel-or-impersonate.guard';

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

describe('AdminPanelOrImpersonateGuard', () => {
  it.each([
    { canAccessFullAdminPanel: true, canImpersonate: false },
    { canAccessFullAdminPanel: false, canImpersonate: true },
  ])('delegates to the server admin access checks for %o', async (flags) => {
    const serverAdminAccessService = buildServerAdminAccessService(true);
    const request = { user: { ...flags, email: 'admin@example.com' } };

    mockRequest(request);

    await expect(
      new AdminPanelOrImpersonateGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).resolves.toBe(true);
    expect(serverAdminAccessService.isRequestAllowed).toHaveBeenCalledWith({
      request,
      userEmail: 'admin@example.com',
    });
  });

  it('refuses a request that fails the server admin access checks', async () => {
    mockRequest({
      user: { canImpersonate: true, email: 'support@example.com' },
    });

    await expect(
      new AdminPanelOrImpersonateGuard(
        buildServerAdminAccessService(false),
      ).canActivate(executionContext),
    ).resolves.toBe(false);
  });

  it('refuses a user with neither privilege without checking access', async () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);

    mockRequest({
      user: { canAccessFullAdminPanel: false, canImpersonate: false },
    });

    await expect(
      new AdminPanelOrImpersonateGuard(serverAdminAccessService).canActivate(
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
      new AdminPanelOrImpersonateGuard(
        buildServerAdminAccessService(true),
      ).canActivate(executionContext),
    ).resolves.toBe(false);
  });
});
