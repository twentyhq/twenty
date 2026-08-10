import { getUsableConnectedAccountHandles } from 'src/engine/core-modules/tool/tools/email-tool/utils/get-usable-connected-account-handles.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

const ownAccount = {
  handle: 'work@example.com',
  userWorkspaceId: USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const colleagueAccount = {
  handle: 'colleague@example.com',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  visibility: 'user' as const,
};

const sharedAccount = {
  handle: 'contact@example.com',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
  visibility: 'workspace' as const,
};

describe('getUsableConnectedAccountHandles', () => {
  it("lists the caller's own and workspace-shared handles", () => {
    expect(
      getUsableConnectedAccountHandles({
        connectedAccounts: [ownAccount, sharedAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual(['work@example.com', 'contact@example.com']);
  });

  it("omits a colleague's private handle", () => {
    expect(
      getUsableConnectedAccountHandles({
        connectedAccounts: [ownAccount, colleagueAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual(['work@example.com']);
  });

  it('deduplicates handles', () => {
    expect(
      getUsableConnectedAccountHandles({
        connectedAccounts: [ownAccount, { ...sharedAccount, ...ownAccount }],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual(['work@example.com']);
  });

  it('lists every handle when there is no caller', () => {
    expect(
      getUsableConnectedAccountHandles({
        connectedAccounts: [ownAccount, colleagueAccount],
      }),
    ).toEqual(['work@example.com', 'colleague@example.com']);
  });

  it('returns an empty list when no account is usable', () => {
    expect(
      getUsableConnectedAccountHandles({
        connectedAccounts: [colleagueAccount],
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual([]);
  });
});
