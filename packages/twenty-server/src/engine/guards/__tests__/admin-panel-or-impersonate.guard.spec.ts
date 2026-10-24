import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AdminPanelOrImpersonateGuard } from 'src/engine/guards/admin-panel-or-impersonate.guard';

const IMPERSONATION_CONTEXT = {
  impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
  impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
};

const canActivateWithRequest = (request: Record<string, unknown>) => {
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: request }),
  } as unknown as GqlExecutionContext);

  return new AdminPanelOrImpersonateGuard().canActivate({} as ExecutionContext);
};

describe('AdminPanelOrImpersonateGuard', () => {
  it('should return true for a user who can impersonate', () => {
    expect(
      canActivateWithRequest({
        user: { canImpersonate: true, canAccessFullAdminPanel: false },
      }),
    ).toBe(true);
  });

  it('should return true for a full admin', () => {
    expect(
      canActivateWithRequest({
        user: { canImpersonate: false, canAccessFullAdminPanel: true },
      }),
    ).toBe(true);
  });

  it('should return false for a user without admin privileges', () => {
    expect(
      canActivateWithRequest({
        user: { canImpersonate: false, canAccessFullAdminPanel: false },
      }),
    ).toBe(false);
  });

  it('should return false for an impersonated session', () => {
    expect(
      canActivateWithRequest({
        user: { canImpersonate: true, canAccessFullAdminPanel: true },
        impersonationContext: IMPERSONATION_CONTEXT,
      }),
    ).toBe(false);
  });
});
