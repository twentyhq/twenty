import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';

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

describe('AdminPanelGuard', () => {
  it('allows a full admin whose request is on an allowed host', () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);
    const request = {
      user: { canAccessFullAdminPanel: true, email: 'admin@example.com' },
    };

    mockRequest(request);

    expect(
      new AdminPanelGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).toBe(true);
    expect(serverAdminAccessService.isRequestAllowed).toHaveBeenCalledWith(
      request,
    );
  });

  it('refuses a full admin whose request is on a refused host', () => {
    mockRequest({
      user: { canAccessFullAdminPanel: true, email: 'admin@example.com' },
    });

    expect(
      new AdminPanelGuard(buildServerAdminAccessService(false)).canActivate(
        executionContext,
      ),
    ).toBe(false);
  });

  it('refuses a user who is not a full admin', () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);

    mockRequest({ user: { canAccessFullAdminPanel: false } });

    expect(
      new AdminPanelGuard(serverAdminAccessService).canActivate(
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
      new AdminPanelGuard(buildServerAdminAccessService(true)).canActivate(
        executionContext,
      ),
    ).toBe(false);
  });
});
