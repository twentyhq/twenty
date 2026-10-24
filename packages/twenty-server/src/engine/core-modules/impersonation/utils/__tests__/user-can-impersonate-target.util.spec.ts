import { userCanImpersonateTarget } from 'src/engine/core-modules/impersonation/utils/user-can-impersonate-target.util';

const REGULAR_USER = { canImpersonate: false, canAccessFullAdminPanel: false };
const IMPERSONATOR_USER = {
  canImpersonate: true,
  canAccessFullAdminPanel: false,
};
const FULL_ADMIN_USER = {
  canImpersonate: false,
  canAccessFullAdminPanel: true,
};

describe('userCanImpersonateTarget', () => {
  it('should allow anyone to impersonate a regular user', () => {
    expect(
      userCanImpersonateTarget({
        impersonatorUser: REGULAR_USER,
        targetUser: REGULAR_USER,
      }),
    ).toBe(true);
  });

  it('should not allow a regular user to impersonate a user who can impersonate', () => {
    expect(
      userCanImpersonateTarget({
        impersonatorUser: REGULAR_USER,
        targetUser: IMPERSONATOR_USER,
      }),
    ).toBe(false);
  });

  it('should allow a user who can impersonate to impersonate another one', () => {
    expect(
      userCanImpersonateTarget({
        impersonatorUser: IMPERSONATOR_USER,
        targetUser: IMPERSONATOR_USER,
      }),
    ).toBe(true);
  });

  it('should not allow a user who can only impersonate to impersonate a full admin', () => {
    expect(
      userCanImpersonateTarget({
        impersonatorUser: IMPERSONATOR_USER,
        targetUser: FULL_ADMIN_USER,
      }),
    ).toBe(false);
  });

  it('should allow a full admin to impersonate another full admin', () => {
    expect(
      userCanImpersonateTarget({
        impersonatorUser: FULL_ADMIN_USER,
        targetUser: FULL_ADMIN_USER,
      }),
    ).toBe(true);
  });
});
