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
    isRequestAllowed: jest.fn().mockReturnValue(isRequestAllowed),
  }) as unknown as ServerAdminAccessService;

const executionContext = {} as ExecutionContext;

describe('AdminPanelOrImpersonateGuard', () => {
  it.each([
    { canAccessFullAdminPanel: true, canImpersonate: false },
    { canAccessFullAdminPanel: false, canImpersonate: true },
  ])('delegates the host check for %o', (flags) => {
    const serverAdminAccessService = buildServerAdminAccessService(true);
    const request = { user: { ...flags, email: 'admin@example.com' } };

    mockRequest(request);

    expect(
      new AdminPanelOrImpersonateGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).toBe(true);
    expect(serverAdminAccessService.isRequestAllowed).toHaveBeenCalledWith(
      request,
    );
  });

  it('refuses a request that is on a refused host', () => {
    mockRequest({
      user: { canImpersonate: true, email: 'support@example.com' },
    });

    expect(
      new AdminPanelOrImpersonateGuard(
        buildServerAdminAccessService(false),
      ).canActivate(executionContext),
    ).toBe(false);
  });

  it('refuses a user with neither privilege without checking access', () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);

    mockRequest({
      user: { canAccessFullAdminPanel: false, canImpersonate: false },
    });

    expect(
      new AdminPanelOrImpersonateGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).toBe(false);
    expect(serverAdminAccessService.isRequestAllowed).not.toHaveBeenCalled();
  });

  it('refuses an impersonated session', () => {
    mockRequest({
      user: { canAccessFullAdminPanel: true },
      impersonationContext: {
        impersonatorUserWorkspaceId: 'impersonator',
        impersonatedUserWorkspaceId: 'impersonated',
      },
    });

    expect(
      new AdminPanelOrImpersonateGuard(
        buildServerAdminAccessService(true),
      ).canActivate(executionContext),
    ).toBe(false);
  });
});
