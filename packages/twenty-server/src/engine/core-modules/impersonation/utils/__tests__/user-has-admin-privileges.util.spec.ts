import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';

describe('userHasAdminPrivileges', () => {
  it('should be true when canImpersonate is true', () => {
    expect(
      userHasAdminPrivileges({
        canImpersonate: true,
        canAccessFullAdminPanel: false,
      }),
    ).toBe(true);
  });

  it('should be true when canAccessFullAdminPanel is true', () => {
    expect(
      userHasAdminPrivileges({
        canImpersonate: false,
        canAccessFullAdminPanel: true,
      }),
    ).toBe(true);
  });

  it('should be false when neither privilege is set', () => {
    expect(
      userHasAdminPrivileges({
        canImpersonate: false,
        canAccessFullAdminPanel: false,
      }),
    ).toBe(false);
  });
});
