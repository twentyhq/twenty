import { userCanWorkspaceImpersonateTarget } from 'src/engine/core-modules/impersonation/utils/user-can-workspace-impersonate-target.util';

const REGULAR_USER = { canImpersonate: false, canAccessFullAdminPanel: false };
const IMPERSONATOR_USER = {
  canImpersonate: true,
  canAccessFullAdminPanel: false,
};
const FULL_ADMIN_USER = {
  canImpersonate: false,
  canAccessFullAdminPanel: true,
};

describe('userCanWorkspaceImpersonateTarget', () => {
  it('should allow a regular user to impersonate another regular user', () => {
    expect(
      userCanWorkspaceImpersonateTarget({
        impersonatorUser: REGULAR_USER,
        targetUser: REGULAR_USER,
      }),
    ).toBe(true);
  });

  it('should not allow a regular user to impersonate a user who can impersonate', () => {
    expect(
      userCanWorkspaceImpersonateTarget({
        impersonatorUser: REGULAR_USER,
        targetUser: IMPERSONATOR_USER,
      }),
    ).toBe(false);
  });

  it('should not allow a user who is not a full admin to impersonate a full admin', () => {
    expect(
      userCanWorkspaceImpersonateTarget({
        impersonatorUser: IMPERSONATOR_USER,
        targetUser: FULL_ADMIN_USER,
      }),
    ).toBe(false);
  });

  it('should allow a full admin to impersonate another full admin', () => {
    expect(
      userCanWorkspaceImpersonateTarget({
        impersonatorUser: FULL_ADMIN_USER,
        targetUser: FULL_ADMIN_USER,
      }),
    ).toBe(true);
  });
});
