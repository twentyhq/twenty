import { isConnectedAccountUsableByCaller } from 'src/engine/core-modules/tool/tools/email-tool/utils/is-connected-account-usable-by-caller.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

describe('isConnectedAccountUsableByCaller', () => {
  it('accepts an account the caller owns', () => {
    expect(
      isConnectedAccountUsableByCaller({
        connectedAccount: {
          userWorkspaceId: USER_WORKSPACE_ID,
          visibility: 'user',
        },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('accepts an account shared with the whole workspace', () => {
    expect(
      isConnectedAccountUsableByCaller({
        connectedAccount: {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          visibility: 'workspace',
        },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('rejects another user private account', () => {
    expect(
      isConnectedAccountUsableByCaller({
        connectedAccount: {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          visibility: 'user',
        },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });
});
