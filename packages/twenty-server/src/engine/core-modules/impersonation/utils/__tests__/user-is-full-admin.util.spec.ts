import { userIsFullAdmin } from 'src/engine/core-modules/impersonation/utils/user-is-full-admin.util';

describe('userIsFullAdmin', () => {
  it('should be true only when canAccessFullAdminPanel is true', () => {
    expect(
      userIsFullAdmin({
        canAccessFullAdminPanel: true,
        canImpersonate: false,
      }),
    ).toBe(true);
    expect(
      userIsFullAdmin({
        canAccessFullAdminPanel: false,
        canImpersonate: true,
      }),
    ).toBe(false);
  });
});
