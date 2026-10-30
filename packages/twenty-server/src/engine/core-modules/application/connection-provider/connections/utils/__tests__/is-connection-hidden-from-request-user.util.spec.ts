import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';

describe('isConnectionHiddenFromRequestUser', () => {
  it("hides another user's USER-scoped connection from a request user", () => {
    expect(
      isConnectionHiddenFromRequestUser({
        account: { scope: 'USER', userWorkspaceId: 'uw-owner' },
        requestUserWorkspaceId: 'uw-someone-else',
      }),
    ).toBe(true);
  });

  it('shows a request user their own USER-scoped connection', () => {
    expect(
      isConnectionHiddenFromRequestUser({
        account: { scope: 'USER', userWorkspaceId: 'uw-owner' },
        requestUserWorkspaceId: 'uw-owner',
      }),
    ).toBe(false);
  });

  it('shows workspace-shared connections to any request user', () => {
    expect(
      isConnectionHiddenFromRequestUser({
        account: { scope: 'WORKSPACE', userWorkspaceId: 'uw-owner' },
        requestUserWorkspaceId: 'uw-someone-else',
      }),
    ).toBe(false);
  });

  it('hides nothing from background executions with no request user', () => {
    expect(
      isConnectionHiddenFromRequestUser({
        account: { scope: 'USER', userWorkspaceId: 'uw-owner' },
        requestUserWorkspaceId: null,
      }),
    ).toBe(false);
  });
});
