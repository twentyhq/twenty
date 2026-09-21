import { selectConnectedAccountIdForCaller } from 'src/engine/core-modules/tool/tools/email-tool/utils/select-connected-account-id-for-caller.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

const ownAccount = {
  id: 'own-account-id',
  userWorkspaceId: USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const colleagueAccount = {
  id: 'colleague-account-id',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const sharedAccount = {
  id: 'shared-account-id',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  visibility: 'workspace' as const,
};

describe('selectConnectedAccountIdForCaller', () => {
  it("returns the caller's own account even when another comes first", () => {
    expect(
      selectConnectedAccountIdForCaller({
        connectedAccounts: [colleagueAccount, ownAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('own-account-id');
  });

  it("prefers the caller's own account over a shared one", () => {
    expect(
      selectConnectedAccountIdForCaller({
        connectedAccounts: [sharedAccount, ownAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('own-account-id');
  });

  it('falls back to an account shared with the whole workspace', () => {
    expect(
      selectConnectedAccountIdForCaller({
        connectedAccounts: [colleagueAccount, sharedAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('shared-account-id');
  });

  it('returns undefined rather than a colleague account', () => {
    expect(
      selectConnectedAccountIdForCaller({
        connectedAccounts: [colleagueAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when there is no account at all', () => {
    expect(
      selectConnectedAccountIdForCaller({
        connectedAccounts: [],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBeUndefined();
  });
});
