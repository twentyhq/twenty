import { userCanServerImpersonateTarget } from 'src/engine/core-modules/impersonation/utils/user-can-server-impersonate-target.util';

const REGULAR_USER = { canImpersonate: false, canAccessFullAdminPanel: false };
const IMPERSONATOR_USER = {
  canImpersonate: true,
  canAccessFullAdminPanel: false,
};
const FULL_ADMIN_USER = {
  canImpersonate: false,
  canAccessFullAdminPanel: true,
};

describe('userCanServerImpersonateTarget', () => {
  it('should allow impersonating a regular user', () => {
    expect(
      userCanServerImpersonateTarget({
        impersonatorUser: IMPERSONATOR_USER,
        targetUser: REGULAR_USER,
      }),
    ).toBe(true);
  });

  it('should allow impersonating another user who can impersonate', () => {
    expect(
      userCanServerImpersonateTarget({
        impersonatorUser: IMPERSONATOR_USER,
        targetUser: IMPERSONATOR_USER,
      }),
    ).toBe(true);
  });

  it('should not allow a user who is not a full admin to impersonate a full admin', () => {
    expect(
      userCanServerImpersonateTarget({
        impersonatorUser: IMPERSONATOR_USER,
        targetUser: FULL_ADMIN_USER,
      }),
    ).toBe(false);
  });

  it('should allow a full admin to impersonate another full admin', () => {
    expect(
      userCanServerImpersonateTarget({
        impersonatorUser: FULL_ADMIN_USER,
        targetUser: FULL_ADMIN_USER,
      }),
    ).toBe(true);
  });
});
