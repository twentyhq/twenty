import { selectConnectedAccountIdByHandle } from 'src/engine/core-modules/tool/tools/email-tool/utils/select-connected-account-id-by-handle.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

const ownAccount = {
  id: 'own-account-id',
  handle: 'work@example.com',
  userWorkspaceId: USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const otherOwnAccount = {
  id: 'other-own-account-id',
  handle: 'personal@example.com',
  userWorkspaceId: USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const colleagueAccount = {
  id: 'colleague-account-id',
  handle: 'colleague@example.com',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const sharedAccount = {
  id: 'shared-account-id',
  handle: 'contact@example.com',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  visibility: 'workspace' as const,
};

describe('selectConnectedAccountIdByHandle', () => {
  it('resolves the account matching the requested handle', () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [ownAccount, otherOwnAccount],
        handle: 'personal@example.com',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('other-own-account-id');
  });

  it('does not fall back to another account when the handle is unknown', () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [ownAccount, otherOwnAccount],
        handle: 'unknown@example.com',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBeUndefined();
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [ownAccount],
        handle: '  Work@Example.COM ',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('own-account-id');
  });

  it('resolves an account shared with the whole workspace', () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [sharedAccount],
        handle: 'contact@example.com',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('shared-account-id');
  });

  it("refuses a colleague's private account even on an exact handle match", () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [colleagueAccount],
        handle: 'colleague@example.com',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBeUndefined();
  });

  it("prefers the caller's own account when two accounts share a handle", () => {
    const sharedHandleColleagueAccount = {
      ...colleagueAccount,
      handle: 'work@example.com',
      visibility: 'workspace' as const,
    };

    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [sharedHandleColleagueAccount, ownAccount],
        handle: 'work@example.com',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe('own-account-id');
  });

  it('matches without visibility filtering when there is no caller', () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [colleagueAccount],
        handle: 'colleague@example.com',
      }),
    ).toBe('colleague-account-id');
  });

  it('returns undefined when there is no account at all', () => {
    expect(
      selectConnectedAccountIdByHandle({
        connectedAccounts: [],
        handle: 'work@example.com',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBeUndefined();
  });
});
