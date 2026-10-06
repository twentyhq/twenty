import { canAdministerConnectedAccount } from '@/settings/app-preferences/utils/canAdministerConnectedAccount';

const OWNER_ID = 'owner';
const OTHER_ID = 'other';

describe('canAdministerConnectedAccount', () => {
  it('should let the owner administer their account whatever its visibility', () => {
    expect(
      canAdministerConnectedAccount({
        account: { userWorkspaceId: OWNER_ID, visibility: 'user' },
        currentUserWorkspaceId: OWNER_ID,
        hasAdministrationPermission: false,
      }),
    ).toBe(true);
  });

  it('should let an administrator act on a workspace-shared account owned by someone else', () => {
    expect(
      canAdministerConnectedAccount({
        account: { userWorkspaceId: OWNER_ID, visibility: 'workspace' },
        currentUserWorkspaceId: OTHER_ID,
        hasAdministrationPermission: true,
      }),
    ).toBe(true);
  });

  it('should refuse a member without the permission on a shared account owned by someone else', () => {
    expect(
      canAdministerConnectedAccount({
        account: { userWorkspaceId: OWNER_ID, visibility: 'workspace' },
        currentUserWorkspaceId: OTHER_ID,
        hasAdministrationPermission: false,
      }),
    ).toBe(false);
  });

  it('should refuse everyone else on a personal account', () => {
    expect(
      canAdministerConnectedAccount({
        account: { userWorkspaceId: OWNER_ID, visibility: 'user' },
        currentUserWorkspaceId: OTHER_ID,
        hasAdministrationPermission: true,
      }),
    ).toBe(false);
  });
});
