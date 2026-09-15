import { userCanServerImpersonate } from 'src/engine/core-modules/impersonation/utils/user-can-server-impersonate.util';

describe('userCanServerImpersonate', () => {
  it('should be true only when canImpersonate is true', () => {
    expect(
      userCanServerImpersonate({
        canImpersonate: true,
        canAccessFullAdminPanel: false,
      }),
    ).toBe(true);
    expect(
      userCanServerImpersonate({
        canImpersonate: false,
        canAccessFullAdminPanel: true,
      }),
    ).toBe(false);
  });
});
