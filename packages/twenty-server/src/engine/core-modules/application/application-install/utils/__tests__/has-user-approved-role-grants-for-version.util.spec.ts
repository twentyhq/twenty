import { hasUserApprovedRoleGrantsForVersion } from 'src/engine/core-modules/application/application-install/utils/has-user-approved-role-grants-for-version.util';

describe('hasUserApprovedRoleGrantsForVersion', () => {
  it('applies an approval given for the resolved version', () => {
    expect(
      hasUserApprovedRoleGrantsForVersion({
        hasUserApprovedRoleGrants: true,
        approvedVersion: '2.0.0',
        resolvedVersion: '2.0.0',
      }),
    ).toBe(true);
  });

  it('does not apply an approval given for another version than the one resolved', () => {
    expect(
      hasUserApprovedRoleGrantsForVersion({
        hasUserApprovedRoleGrants: true,
        approvedVersion: '2.0.0',
        resolvedVersion: '3.0.0',
      }),
    ).toBe(false);
  });

  it('does not apply an approval given without a version', () => {
    expect(
      hasUserApprovedRoleGrantsForVersion({
        hasUserApprovedRoleGrants: true,
        resolvedVersion: '3.0.0',
      }),
    ).toBe(false);
  });
});
